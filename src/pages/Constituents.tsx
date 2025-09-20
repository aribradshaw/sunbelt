import React, { useState, useMemo } from 'react';
import { FaRepublican, FaDemocrat } from 'react-icons/fa';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { parseVoterRecord, filterVoters, sortVoters, hasPartyIcon, getPartyIcon, type ParsedVoter } from '../utils/samherstParse';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Voter {
  [key: string]: string | number | undefined;
}

interface ConstituentsProps {
  voters: Voter[];
  onUpdateVoter?: (voterId: string, field: string, value: any) => void;
}

const Constituents: React.FC<ConstituentsProps> = ({ voters, onUpdateVoter }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [voterStatuses, setVoterStatuses] = useState<{ [key: string]: boolean }>({});
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  // Generate unique ID for each voter
  const getVoterId = (person: ParsedVoter) => {
    return `${person.firstName}-${person.lastName}-${person.address}`.replace(/\s+/g, '-').toLowerCase();
  };

  // Toggle dropdown for a specific voter
  const toggleDropdown = (voterId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(voterId)) {
        newSet.delete(voterId);
      } else {
        newSet.add(voterId);
      }
      return newSet;
    });
  };

  // Toggle voter confirmation status
  const toggleVoterStatus = (voterId: string) => {
    const newStatus = !voterStatuses[voterId];
    setVoterStatuses(prev => ({
      ...prev,
      [voterId]: newStatus
    }));
    
    // Update the voter data via the callback
    if (onUpdateVoter) {
      onUpdateVoter(voterId, 'Voter Status', newStatus ? 'X' : '');
    }
  };

  // Get voter status (from state or original data)
  const getVoterStatus = (person: ParsedVoter) => {
    const voterId = getVoterId(person);
    return voterStatuses[voterId] !== undefined ? voterStatuses[voterId] : !!person.voterStatus;
  };

  // Load voter statuses from the voter data when component mounts or voters change
  React.useEffect(() => {
    if (voters && voters.length > 0) {
      const newStatuses: { [key: string]: boolean } = {};
      voters.forEach(voter => {
        const firstName = String(voter.FIRSTN || '');
        const lastName = String(voter.LASTN || '');
        const address = String(voter.STREET_ADDRESS || '').trim();
        const voterId = `${firstName}-${lastName}-${address}`.replace(/\s+/g, '-').toLowerCase();
        
        // Check for various status fields
        const isConfirmed = !!(voter['Voter Status'] || voter.voterStatus);
        const hasKnocked = !!(voter['Knocked Door'] || voter.knockedDoor);
        const hasCalled = !!(voter['Voter Called'] || voter.voterCalled);
        const hasTexted = !!(voter['Voter Texted'] || voter.voterTexted);
        const hasMailed = !!(voter['Voter Mailed'] || voter.voterMailed);
        const hasPamphlet = !!(voter['Left Pamphlet'] || voter.leftPamphlet);
        
        if (isConfirmed || hasKnocked || hasCalled || hasTexted || hasMailed || hasPamphlet) {
          newStatuses[voterId] = isConfirmed;
        }
      });
      setVoterStatuses(newStatuses);
    }
  }, [voters]);

  // Toggle voter action status
  const toggleVoterAction = (voterId: string, actionKey: string) => {
    // Update the voter data via the callback
    if (onUpdateVoter) {
      onUpdateVoter(voterId, actionKey, 'X');
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setOpenDropdowns(new Set());
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      closeAllDropdowns();
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  console.log('Constituents voters prop:', voters.length, voters);

  // Check if this is South Amherst data (has LASTN, FIRSTN fields)
  const isSouthAmherst = voters.length > 0 && voters[0] && 'LASTN' in voters[0] && 'FIRSTN' in voters[0];

  // Get all unique keys from the data for filter sidebar
  const filterKeys = useMemo(() => {
    if (!voters || voters.length === 0) return [];
    // Use all keys from all voters, not just the first
    const allKeys = new Set<string>();
    voters.forEach(v => {
      Object.keys(v).forEach(k => {
        if (typeof v[k] === 'string' || typeof v[k] === 'number') {
          allKeys.add(k);
        }
      });
    });
    return Array.from(allKeys);
  }, [voters]);

  // For each key, get unique values for filter options
  const filterOptions = useMemo(() => {
    const opts: { [key: string]: string[] } = {};
    filterKeys.forEach(key => {
      opts[key] = Array.from(new Set(voters.map(v => String(v[key] || '')).filter(Boolean))).slice(0, 100); // limit to 100 unique values
    });
    return opts;
  }, [filterKeys, voters]);

  // For South Amherst, create a simple names list
  const southAmherstNames = useMemo(() => {
    if (!isSouthAmherst) return [];
    
    // Parse all voters using the utility functions
    const parsedVoters = voters.map(parseVoterRecord);

    // Apply search filter
    const filteredVoters = filterVoters(parsedVoters, search);
    
    // Sort voters
    const sortedVoters = sortVoters(filteredVoters);

    return sortedVoters;
  }, [voters, search, isSouthAmherst]);

  // Filter and search voters (for non-South Amherst data)
  const filteredVoters = useMemo(() => {
    if (isSouthAmherst) return []; // Don't use this for South Amherst
    
    let result = voters.filter(v => {
      // Apply filters
      for (const key in filters) {
        if (filters[key] && v[key] !== filters[key]) return false;
      }
      // Apply search (searches all string fields)
      if (search) {
        const s = search.toLowerCase();
        return Object.values(v).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(s)
        );
      }
      return true;
    });
    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortOrder === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return result;
  }, [voters, filters, search, sortKey, sortOrder, isSouthAmherst]);

  // Auto-select a sort key if not set and voters exist
  React.useEffect(() => {
    if (!sortKey && filterKeys.length > 0) {
      setSortKey(filterKeys[0]);
    }
  }, [filterKeys, sortKey]);

  // South Amherst names list display
  if (isSouthAmherst) {
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
        <h2>South Amherst Village Constituents</h2>
        <p>Complete list of {voters.length} registered voters in South Amherst Village.</p>
          </div>
          
          {/* Dashboard Charts */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {/* Party Affiliation Chart */}
            <div style={{ 
              background: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: 8, 
              padding: 16, 
              minWidth: 200,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#374151' }}>Party Affiliation</h4>
              {(() => {
                const partyStats = southAmherstNames.reduce((acc, person) => {
                  if (person.party === 'REP') acc.rep++;
                  else if (person.party === 'DEM') acc.dem++;
                  else acc.other++;
                  return acc;
                }, { rep: 0, dem: 0, other: 0 });
                
                const data = {
                  labels: ['Republican', 'Democrat', 'Other'],
                  datasets: [{
                    data: [partyStats.rep, partyStats.dem, partyStats.other],
                    backgroundColor: ['#dc2626', '#2563eb', '#6b7280'],
                    borderWidth: 0
                  }]
                };
                
                const options = {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        padding: 10,
                        font: { size: 11 }
                      }
                    }
                  }
                };
                
                return (
                  <div style={{ height: 150, width: 150 }}>
                    <Pie data={data} options={options} />
                  </div>
                );
              })()}
            </div>

            {/* Last Voted Year Chart */}
            <div style={{ 
              background: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: 8, 
              padding: 16, 
              minWidth: 200,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#374151' }}>Last Voted</h4>
              {(() => {
                const yearStats = southAmherstNames.reduce((acc, person) => {
                  const year = person.lastVote;
                  acc[year] = (acc[year] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                // Sort years in descending order, with "Never Voted" at the end
                const sortedEntries = Object.entries(yearStats).sort(([a], [b]) => {
                  if (a === 'Never Voted') return 1;
                  if (b === 'Never Voted') return -1;
                  if (a === 'May 2025') return -1;
                  if (b === 'May 2025') return 1;
                  return b.localeCompare(a);
                });
                
                const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280', '#9ca3af', '#d1d5db'];
                
                const data = {
                  labels: sortedEntries.map(([year]) => year),
                  datasets: [{
                    data: sortedEntries.map(([, count]) => count),
                    backgroundColor: sortedEntries.map((_, index) => colors[index % colors.length]),
                    borderWidth: 0
                  }]
                };
                
                const options = {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        padding: 8,
                        font: { size: 10 }
                      }
                    }
                  }
                };
                
                return (
                  <div style={{ height: 150, width: 150 }}>
                    <Pie data={data} options={options} />
                  </div>
                );
              })()}
            </div>

            {/* Contact Status Chart */}
            <div style={{ 
              background: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: 8, 
              padding: 16, 
              minWidth: 200,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#374151' }}>Contact Status</h4>
              {(() => {
                const contactStats = southAmherstNames.reduce((acc, person) => {
                  const voterId = getVoterId(person);
                  const isConfirmed = voterStatuses[voterId] !== undefined ? voterStatuses[voterId] : !!person.voterStatus;
                  const hasContact = person.knockedDoor || person.voterCalled || person.voterTexted || person.leftPamphlet || person.voterMailed;
                  
                  if (isConfirmed) acc.confirmed++;
                  else if (hasContact) acc.contacted++;
                  else acc.uncontacted++;
                  return acc;
                }, { confirmed: 0, contacted: 0, uncontacted: 0 });
                
                const data = {
                  labels: ['Confirmed', 'Contacted', 'Uncontacted'],
                  datasets: [{
                    data: [contactStats.confirmed, contactStats.contacted, contactStats.uncontacted],
                    backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                    borderWidth: 0
                  }]
                };
                
                const options = {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        padding: 10,
                        font: { size: 11 }
                      }
                    }
                  }
                };
                
                return (
                  <div style={{ height: 150, width: 150 }}>
                    <Pie data={data} options={options} />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        
        {/* Search bar */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search by name, address, party, religion, or phone..."
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
              
              {/* Religion and Phone Information */}
              {(person.religion || person.allPhones.length > 0) && (
                <div style={{ marginBottom: 8, padding: 8, background: '#f8f9fa', borderRadius: 4 }}>
                  {person.religion && (
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      <strong>Religion:</strong> {person.religion}
                    </div>
                  )}
                  {person.allPhones.length > 0 && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <strong>Phone{person.allPhones.length > 1 ? 's' : ''}:</strong> {person.allPhones.join(', ')}
                    </div>
                  )}
                </div>
              )}
              
              {/* Status bar */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                padding: '8px 12px',
                background: getVoterStatus(person) ? '#f0f9ff' : '#f9fafb',
                border: `1px solid ${getVoterStatus(person) ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleVoterStatus(voterId);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = getVoterStatus(person) ? '#dbeafe' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = getVoterStatus(person) ? '#f0f9ff' : '#f9fafb';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `2px solid ${getVoterStatus(person) ? '#3b82f6' : '#d1d5db'}`,
                    background: getVoterStatus(person) ? '#3b82f6' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {getVoterStatus(person) ? '✓' : ''}
                  </div>
                  <span style={{ 
                    color: getVoterStatus(person) ? '#1e40af' : '#6b7280',
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    Voter Confirmed
                  </span>
                </div>
                
                {/* Actions dropdown */}
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(voterId);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                                      <span style={{ fontSize: 10, transform: openDropdowns.has(voterId) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
              </div>
              
              {/* Expandable actions section */}
              {openDropdowns.has(voterId) && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  marginTop: 8,
                  padding: '12px',
                  animation: 'fadeIn 0.2s ease-in-out'
                }}>
                  <div style={{ 
                    fontSize: 11, 
                    color: '#6b7280', 
                    marginBottom: 8, 
                    fontWeight: 500 
                  }}>
                    Voter Actions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { key: 'knockedDoor', label: 'Knocked Door', checked: person.knockedDoor },
                      { key: 'voterCalled', label: 'Voter Called', checked: person.voterCalled },
                      { key: 'voterTexted', label: 'Voter Texted', checked: person.voterTexted },
                      { key: 'leftPamphlet', label: 'Left Pamphlet', checked: person.leftPamphlet },
                      { key: 'voterMailed', label: 'Voter Mailed', checked: person.voterMailed }
                    ].map(action => (
                      <div
                        key={action.key}
                        style={{
                          padding: '8px 12px',
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: action.checked ? '#1e40af' : '#6b7280',
                          fontWeight: action.checked ? 500 : 400,
                          borderRadius: 4,
                          transition: 'background-color 0.2s'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVoterAction(voterId, action.key);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ 
                          width: 18,
                          height: 18,
                          borderRadius: 3,
                          border: `2px solid ${action.checked ? '#3b82f6' : '#d1d5db'}`,
                          background: action.checked ? '#3b82f6' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {action.checked ? '✓' : ''}
                        </div>
                        <span>{action.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 12, fontSize: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                {person.lastVote && (
                  <span style={{ color: '#888' }}>
                    Last voted: {person.lastVote}
                  </span>
                )}
                
                {/* Phone indicators in bottom right */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {person.allPhones.slice(0, 3).map((phone, index) => (
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
                  ))}
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
          Showing {southAmherstNames.length} of {voters.length} constituents
          {search && ` (filtered by "${search}")`}
        </div>
      </div>
    );
  }

  // Default table view for other data
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Sidebar for filters */}
      <aside style={{ minWidth: 220, background: '#f8f8f8', padding: 16, borderRadius: 8 }}>
        <h3>Filters</h3>
        {filterKeys.map(key => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>{key}</label>
            <select
              value={filters[key] || ''}
              onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
              style={{ width: '100%', marginTop: 4 }}
            >
              <option value=''>All</option>
              {filterOptions[key].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        ))}
        <button onClick={() => setFilters({})} style={{ marginTop: 8, width: '100%' }}>Clear Filters</button>
      </aside>
      <div style={{ flex: 1 }}>
        <h2>Constituents</h2>
        <p>Manage your constituent lists, voices, and fields.</p>
        {/* Sort bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
          <label htmlFor="sortKey" style={{ fontWeight: 500, fontSize: 18 }}>Sort by:</label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            style={{ padding: '10px 16px', fontSize: 18, minWidth: 180, borderRadius: 6, border: '1px solid #bbb' }}
          >
            {filterKeys.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            style={{ padding: '10px 16px', fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#f8f8f8', cursor: 'pointer' }}
            aria-label="Toggle sort order"
          >
            {sortOrder === 'asc' ? '▲' : '▼'}
          </button>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 320, marginLeft: 24, padding: '10px 16px', fontSize: 18, borderRadius: 6, border: '1px solid #bbb' }}
          />
        </div>
        <div style={{ overflowX: 'auto', maxHeight: 600 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {filterKeys.map(key => (
                  <th key={key} style={{ borderBottom: '1px solid #ccc', padding: 6, background: '#f0f0f0', position: 'sticky', top: 0 }}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVoters.slice(0, 200).map((v, i) => (
                <tr key={i} style={{ background: i % 2 ? '#fafbfc' : 'white' }}>
                  {filterKeys.map(key => (
                    <td key={key} style={{ padding: 6, borderBottom: '1px solid #eee', fontSize: 14, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVoters.length > 200 && <div style={{ marginTop: 8, color: '#888' }}>Showing first 200 of {filteredVoters.length} results.</div>}
        </div>
      </div>
    </div>
  );
};

export default Constituents;
