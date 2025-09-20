
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';


import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon for leaflet in webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;



type Voter = {
  [key: string]: string;
};

type FieldsProps = {
  voters?: Voter[];
};

const partyOptions = [
  'All',
  'Democrat',
  'Republican',
  'Independent',
  'Libertarian',
  'No Labels',
  'Unaffiliated',
];


const Fields: React.FC<FieldsProps> = ({ voters }) => {
  const [party, setParty] = useState('All');
  // Use leaflet LatLngBounds type for bounds
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  // Only use voters with valid lat/lon
  const geoVoters = useMemo(() => {
    if (!voters) return [];
    return voters.filter(v => {
      const lat = parseFloat(v['Latitude'] || v['lat']);
      const lon = parseFloat(v['Longitude'] || v['lon']);
      return !isNaN(lat) && !isNaN(lon);
    });
  }, [voters]);

  // Filter by party
  const filtered = useMemo(() => {
    if (party === 'All') return geoVoters;
    return geoVoters.filter(v => v['OfficialParty'] === party);
  }, [geoVoters, party]);



  // Further filter by map bounds, and auto-load in batches for performance
  const [batch, setBatch] = useState(1);
  const BATCH_SIZE = 2000; // Number of points to render per batch
  const visible = useMemo(() => {
    let points = filtered;
    if (bounds) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      points = points.filter(v => {
        const lat = parseFloat(v['Latitude'] || v['lat']);
        const lon = parseFloat(v['Longitude'] || v['lon']);
        return lat >= sw.lat && lat <= ne.lat && lon >= sw.lng && lon <= ne.lng;
      });
    }
    return points.slice(0, batch * BATCH_SIZE);
  }, [filtered, bounds, batch]);

  // When bounds or filter changes, reset batch
  React.useEffect(() => {
    setBatch(1);
  }, [filtered, bounds]);

  // Auto-increment batch to load more points until all are visible
  useEffect(() => {
    if (visible.length < filtered.length) {
      const timeout = setTimeout(() => setBatch(b => b + 1), 200);
      return () => clearTimeout(timeout);
    }
  }, [visible.length, filtered.length]);

  // Custom component to track map bounds (fix: always set bounds on mount and on move/zoom)
  function BoundsTracker() {
    useMapEvents({
      moveend: (e) => {
        setBounds(e.target.getBounds());
      },
      zoomend: (e) => {
        setBounds(e.target.getBounds());
      },
      load: (e) => {
        setBounds(e.target.getBounds());
      }
    });
    // Set bounds on mount
    useEffect(() => {
      // Use leaflet's global to get the map instance if available
      // But in practice, bounds will be set on first move/zoom
    }, []);
    return null;
  }

  return (
    <div>
      <h2>Fields</h2>
      <p>Field operations and canvassing. Map below shows all voters with latitude/longitude in the CSV.</p>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 500, marginRight: 8 }}>Filter by Party:</label>
        <select value={party} onChange={e => setParty(e.target.value)}>
          {partyOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div style={{ height: 500, width: '100%', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #0001' }}>
        <MapContainer center={[33.6, -112.05]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsTracker />
          <MarkerClusterGroup chunkedLoading>
            {visible.map((v, i) => {
              const lat = parseFloat(v['Latitude'] || v['lat']);
              const lon = parseFloat(v['Longitude'] || v['lon']);
              return (
                <Marker key={i} position={[lat, lon]}>
                  <Popup>
                    <div>
                      <strong>{v['FirstName']} {v['LastName']}</strong><br />
                      {v['PrimaryAddress1']}<br />
                      {v['PrimaryCity']}, {v['PrimaryState']} {v['PrimaryZip']}<br />
                      Party: {v['OfficialParty']}<br />
                      Age: {v['Age']}<br />
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
        {visible.length} voters shown in current map view. (Only those with valid latitude/longitude are mapped.)
        {visible.length < filtered.length && (
          <span style={{ marginLeft: 16 }}>Loading more...</span>
        )}
      </div>
    </div>
  );
};

export default Fields;
