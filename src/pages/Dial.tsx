import React, { useState, useMemo } from 'react';
import { FaRepublican, FaDemocrat } from 'react-icons/fa';
import { parseVoterRecord, filterVoters, sortVoters, hasPartyIcon, getPartyIcon, type ParsedVoter } from '../utils/samherstParse';

interface Voter {
  [key: string]: string | number | undefined;
}

interface DialProps {
  voters: Voter[];
  onUpdateVoter?: (voterId: string, field: string, value: any) => void;
}

const Dial: React.FC<DialProps> = ({ voters, onUpdateVoter }) => {
  const [search, setSearch] = useState('');
  const [voterStatuses, setVoterStatuses] = useState<{ [key: string]: boolean }>({});
  // Generate unique ID for each voter
  const getVoterId = (person: ParsedVoter) => {
    return `${person.firstName}-${person.lastName}-${person.address}`.replace(/\s+/g, '-').toLowerCase();
  };

  // Toggle voter confirmation status
  const toggleVoterStatus = (voterId: string) => {
    const newStatus = !voterStatuses[voterId];
    setVoterStatuses(prev => ({
      ...prev,
      [voterId]: newStatus
    }));
    
    // Update the original data
    if (onUpdateVoter) {
      onUpdateVoter(voterId, 'Voter Status', newStatus ? 'X' : '');
    }
  };

  // Toggle voter texted status
  const toggleVoterTexted = (voterId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (onUpdateVoter) {
      onUpdateVoter(voterId, 'Voter Texted', newStatus ? 'X' : '');
    }
  };

  // Toggle voter mailed status
  const toggleVoterMailed = (voterId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (onUpdateVoter) {
      onUpdateVoter(voterId, 'Voter Mailed', newStatus ? 'X' : '');
    }
  };

  // Get voter status (from state or original data)
  const getVoterStatus = (person: ParsedVoter) => {
    const voterId = getVoterId(person);
    return voterStatuses[voterId] !== undefined ? voterStatuses[voterId] : !!person.voterStatus;
  };


  // Dial page is specifically for South Amherst data with phone numbers


  // For South Amherst, create a simple names list - BUT ONLY WITH PHONE NUMBERS
  const southAmherstNames = useMemo(() => {
    if (!voters || voters.length === 0) return [];
    
    // First filter for people with phone numbers from the original data
    const votersWithPhones = voters.filter(voter => {
      // Check various possible phone number field names
      return voter['Phone Main'] || 
             voter['Phone 2'] || 
             voter['Phone 3'] ||
             voter.phoneMain ||
             voter.phone2 ||
             voter.phone3 ||
             voter['phoneMain'] ||
             voter['phone2'] ||
             voter['phone3'];
    });

    console.log('Total voters:', voters.length);
    console.log('Voters with phones:', votersWithPhones.length);
    console.log('Sample voter with phones:', votersWithPhones[0]);
    console.log('Sample voter keys:', votersWithPhones[0] ? Object.keys(votersWithPhones[0]) : 'no voters');

    // Parse the filtered voters using the utility functions
    const parsedVoters = votersWithPhones.map(parseVoterRecord);
    
    console.log('Sample parsed voter:', parsedVoters[0]);
    console.log('Parsed voter fullName:', parsedVoters[0]?.fullName);
    console.log('Parsed voter phoneMain:', parsedVoters[0]?.phoneMain);

    // Apply search filter
    const filteredVoters = filterVoters(parsedVoters, search);
    
    // Sort voters
    const sortedVoters = sortVoters(filteredVoters);

    return sortedVoters;
  }, [voters, search]);



  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Loading state
  if (!voters || voters.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Dial Lists</h2>
        <p>Loading voter data...</p>
      </div>
    );
  }

  // Always show card view for Dial page
  if (true) {
    return (
      <div>
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
  <div>
            <h2>Dial Lists</h2>
            <p>Phone banking and call lists for {southAmherstNames.length} constituents with phone numbers.</p>
          </div>
        </div>
        
        {/* Search bar */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search by name, address, phone number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              maxWidth: 500, 
              padding: '12px 16px', 
              fontSize: 16, 
              borderRadius: 8, 
              border: '2px solid #ddd',
              outline: 'none'
            }}
          />
        </div>

        {/* Names list */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: 16,
          maxHeight: '70vh',
          overflowY: 'auto',
          overflowX: 'visible',
          padding: '0 8px',
          position: 'relative'
        }}>
                  {southAmherstNames.map((person, i) => {
          const voterId = getVoterId(person);
            
            return (
            <div 
              key={i} 
              style={{ 
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: 16,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.2s',
                position: 'relative',
                overflow: 'visible'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {/* Party Icon in top right */}
              {hasPartyIcon(person.party) && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  fontSize: 24,
                  color: getPartyIcon(person.party) === 'republican' ? '#dc2626' : 
                         getPartyIcon(person.party) === 'democrat' ? '#2563eb' : '#16a34a'
                }}>
                  {getPartyIcon(person.party) === 'republican' && <FaRepublican />}
                  {getPartyIcon(person.party) === 'democrat' && <FaDemocrat />}
                  {getPartyIcon(person.party) === 'green' && '🍃'}
                </div>
              )}
              <div style={{ 
                fontWeight: 600, 
                fontSize: 18, 
                color: '#253874', 
                marginBottom: 8,
                paddingRight: hasPartyIcon(person.party) ? 40 : 0
              }}>
                {person.fullName}
              </div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                {person.address}
              </div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                {person.city}, OH {person.zip}
              </div>
              
              {/* Phone Numbers */}
              <div style={{ marginBottom: 8, padding: 8, background: '#f8f9fa', borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4, fontWeight: '600' }}>
                  Phone Numbers:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(() => {
                    const mainPhone = person.phoneMain;
                    const alt1Phone = person.phone2;
                    const alt2Phone = person.phone3;
                    
                    const phoneEntries = [];
                    
                    // Always show main phone
                    if (mainPhone) {
                      phoneEntries.push({ phone: mainPhone, label: 'Main:' });
                    }
                    
                    // Show Alt 1 only if it exists and is different from main
                    if (alt1Phone && alt1Phone !== mainPhone) {
                      phoneEntries.push({ phone: alt1Phone, label: 'Alt 1:' });
                    }
                    
                    // Show Alt 2 only if it exists and is different from main
                    if (alt2Phone && alt2Phone !== mainPhone) {
                      phoneEntries.push({ phone: alt2Phone, label: 'Alt 2:' });
                    }
                    
                    return phoneEntries.map((entry, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: 12
                      }}>
                        <span style={{ color: '#6b7280', minWidth: '60px' }}>
                          {entry.label}
                        </span>
                        <a 
                          href={`tel:${entry.phone}`}
                          style={{ 
                            color: '#3b82f6', 
                            textDecoration: 'none',
                            fontWeight: '500'
                          }}
                        >
                          {formatPhoneNumber(entry.phone)}
                        </a>
                      </div>
                    ));
                  })()}
                </div>
              </div>
              
              {/* Religion and Phone Information */}
              {person.religion && (
                <div style={{ marginBottom: 8, padding: 8, background: '#f8f9fa', borderRadius: 4 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    <strong>Religion:</strong> {person.religion}
                  </div>
                </div>
              )}
              
              {/* Status checkboxes */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ 
                  fontSize: 12, 
                  color: '#374151', 
                  marginBottom: 8, 
                  fontWeight: '600' 
                }}>
                  Status:
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { key: 'confirmed', label: 'Confirmed', checked: getVoterStatus(person), color: '#10b981' },
                    { key: 'texted', label: 'Texted', checked: person.voterTexted, color: '#3b82f6' },
                    { key: 'mailed', label: 'Mailed', checked: person.voterMailed, color: '#f59e0b' }
                  ].map(status => (
                    <label key={status.key} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: status.checked ? `${status.color}20` : '#f3f4f6',
                      border: `1px solid ${status.checked ? status.color : '#e5e7eb'}`,
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={status.checked}
                        onChange={() => {
                          if (status.key === 'confirmed') {
                            toggleVoterStatus(voterId);
                          } else if (status.key === 'texted') {
                            toggleVoterTexted(voterId, person.voterTexted);
                          } else if (status.key === 'mailed') {
                            toggleVoterMailed(voterId, person.voterMailed);
                          }
                        }}
                        style={{
                          width: '14px',
                          height: '14px',
                          accentColor: status.color
                        }}
                      />
                      <span style={{ 
                        color: status.checked ? status.color : '#6b7280',
                        fontWeight: status.checked ? 500 : 400
                      }}>
                        {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12, fontSize: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                {person.lastVote && (
                  <span style={{ color: '#888' }}>
                    Last voted: {person.lastVote}
                  </span>
                )}
                
                {/* Phone indicators in bottom right */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {(() => {
                    const mainPhone = person.phoneMain;
                    const alt1Phone = person.phone2;
                    const alt2Phone = person.phone3;
                    
                    const phoneEntries = [];
                    
                    // Always show main phone
                    if (mainPhone) {
                      phoneEntries.push(mainPhone);
                    }
                    
                    // Show Alt 1 only if it exists and is different from main
                    if (alt1Phone && alt1Phone !== mainPhone) {
                      phoneEntries.push(alt1Phone);
                    }
                    
                    // Show Alt 2 only if it exists and is different from main
                    if (alt2Phone && alt2Phone !== mainPhone) {
                      phoneEntries.push(alt2Phone);
                    }
                    
                    return phoneEntries.slice(0, 3).map((phone, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: 14,
                          opacity: 1 - (index * 0.3), // Fade: 1.0, 0.7, 0.4
                          color: '#2563eb',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s'
                        }}
                        title={phone}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = String(1 - (index * 0.3));
                        }}
                      >
                        📞
                      </span>
                    ));
                  })()}
                </div>
              </div>
            </div>
            );
          })}
        </div>
        
        {southAmherstNames.length === 0 && search && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            No constituents found matching "{search}"
          </div>
        )}
        
        <div style={{ marginTop: 16, color: '#888', fontSize: 14 }}>
          Showing {southAmherstNames.length} of {voters.length} constituents with phone numbers
          {search && ` (filtered by "${search}")`}
        </div>
        
        {/* Debug info */}
        <div style={{ marginTop: 8, color: '#666', fontSize: 12, fontFamily: 'monospace' }}>
          Debug: Total voters: {voters.length}, With phones: {voters.filter(v => v['Phone Main'] || v['Phone 2'] || v['Phone 3'] || v.phoneMain || v.phone2 || v.phone3).length}
        </div>
  </div>
);
  }
};

export default Dial;