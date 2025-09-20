import './App.css';
import React, { useState } from 'react';
import Login from './pages/Login';
import type { User } from './pages/Login';
import SunbeltIcon from './SunbeltIcon';
import Constituents from './pages/Constituents';
import Turf from './pages/Turf';
import Dial from './pages/Dial';
import Planner from './pages/Planner';
import Fundraising from './pages/Fundraising';
import Amplify from './pages/Amplify';
import Press from './pages/Press';
import SocialMedia from './pages/SocialMedia';
import Ads from './pages/Ads';
import SMS from './pages/SMS';
import Email from './pages/Email';
import Account from './pages/Account';

type Constituency = {
  name: string;
  voters: any[];
  selectable: boolean;
  group: string;
};

const initialConstituencies: Constituency[] = [
  // Legislative Districts
  { name: "2", voters: [], selectable: true, group: "LEGISLATIVE DISTRICTS" },
  { name: "5", voters: [], selectable: false, group: "LEGISLATIVE DISTRICTS" },
  { name: "8", voters: [], selectable: false, group: "LEGISLATIVE DISTRICTS" },
  { name: "11", voters: [], selectable: false, group: "LEGISLATIVE DISTRICTS" },
  { name: "12", voters: [], selectable: false, group: "LEGISLATIVE DISTRICTS" },
  { name: "22", voters: [], selectable: false, group: "LEGISLATIVE DISTRICTS" },
  { name: "24", voters: [], selectable: false, group: "LEGISLATIVE DISTRICTS" },
  { name: "26", voters: [], selectable: false, group: "LEGISLATIVE DISTRICTS" },
  // Phoenix City Council
  { name: "2", voters: [], selectable: false, group: "PHOENIX CITY COUNCIL DISTRICTS" },
  { name: "4", voters: [], selectable: false, group: "PHOENIX CITY COUNCIL DISTRICTS" },
  { name: "6", voters: [], selectable: false, group: "PHOENIX CITY COUNCIL DISTRICTS" },
  { name: "8", voters: [], selectable: false, group: "PHOENIX CITY COUNCIL DISTRICTS" },
  // Ohio Districts
  { name: "Lorain Municipal Court", voters: [], selectable: true, group: "OHIO DISTRICTS" },
  { name: "South Amherst Village", voters: [], selectable: true, group: "OHIO DISTRICTS" },
  { name: "52nd House District", voters: [], selectable: false, group: "OHIO DISTRICTS" },
];

function App() {
  // User login state
  const [user, setUser] = useState<User | null>(null);
  const [constituencies] = useState(initialConstituencies);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState<string | null>('Constituents');
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [ld2Voters, setLd2Voters] = useState<any[] | null>(null);
  const [lorainVoters, setLorainVoters] = useState<any[] | null>(null);
  const [samherstVoters, setSamherstVoters] = useState<any[] | null>(null);
  const [samherstChristians, setSamherstChristians] = useState<any[] | null>(null);

  // Function to match people between main CSV and Christians CSV
  const matchVoterData = React.useCallback((mainVoters: any[], christiansData: any[]) => {
    return mainVoters.map(voter => {
      // Try to find matching person in Christians data
      const match = christiansData.find(christian => {
        // Match by first name, last name, and address
        const firstNameMatch = christian.First?.toLowerCase() === voter.FIRSTN?.toLowerCase();
        const lastNameMatch = christian.Last?.toLowerCase() === voter.LASTN?.toLowerCase();
        
        // Match by address (street number + street name)
        const mainAddress = `${voter.STNUM || ''} ${voter.STDIR || ''} ${voter.STNAME || ''}`.trim().toLowerCase();
        const christianAddress = `${christian['Street Address'] || ''}`.trim().toLowerCase();
        const addressMatch = mainAddress === christianAddress;
        
        return firstNameMatch && lastNameMatch && addressMatch;
      });

      if (match) {
        return {
          ...voter,
          religion: match.Religion || '',
          phoneMain: match['Phone Main'] || '',
          phoneType: match['Landline or Cell'] || '',
          phone2: match['Phone 2'] || '',
          phone3: match['Phone 3'] || '',
          // Combine all phone numbers into an array
          allPhones: [
            match['Phone Main'],
            match['Phone 2'],
            match['Phone 3']
          ].filter(Boolean),
        };
      }

      return voter;
    });
  }, []);

  // Function to reload South Amherst data from CSV
  const reloadSamherstData = React.useCallback(async () => {
    if (!user || user.portal !== 'SouthAmherst') return;
    
    try {
      const csvUrl = import.meta.env.BASE_URL + 'voters/csv/SAMHERSTchristians.csv';
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error('CSV file not found');
      const csvText = await res.text();
      
      // Parse CSV
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        setSamherstVoters([]);
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const voters = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const voter: any = {};
        headers.forEach((header, index) => {
          voter[header] = values[index] || '';
        });
        return voter;
      }).filter(voter => voter && Object.keys(voter).length > 0);
      
      console.log(`[South Amherst Reloader] Reloaded ${voters.length} voters from CSV`);
      
      // Match with Christians data if available
      if (samherstChristians && samherstChristians.length > 0) {
        const matchedVoters = matchVoterData(voters, samherstChristians);
        console.log(`[South Amherst Reloader] Matched ${matchedVoters.filter(v => v.religion).length} voters with religion/phone data`);
        setSamherstVoters(matchedVoters);
      } else {
        setSamherstVoters(voters);
      }
    } catch (e) {
      console.error('[South Amherst Reloader] Error reloading CSV:', e);
    }
  }, [user, samherstChristians, matchVoterData]);

  // Function to update voter data
  const updateVoterData = async (voterId: string, field: string, value: any) => {
    if (user?.portal === 'SouthAmherst' && samherstVoters) {
      // Update local state immediately for responsive UI
      const updatedVoters = samherstVoters.map(voter => {
        // Create a unique ID for the voter (same logic as in Dial component)
        const firstName = String(voter.FIRSTN || '');
        const lastName = String(voter.LASTN || '');
        const address = String(voter.STREET_ADDRESS || '').trim();
        const currentVoterId = `${firstName}-${lastName}-${address}`.replace(/\s+/g, '-').toLowerCase();
        
        if (currentVoterId === voterId) {
          return { ...voter, [field]: value };
        }
        return voter;
      });
      
      setSamherstVoters(updatedVoters);
      
      // Save to server via PHP API
      try {
        const response = await fetch('/api/update-voter.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            voterId,
            field,
            value,
            portal: user.portal
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Failed to update voter:', result.error);
          // Revert local state on error
          setSamherstVoters(samherstVoters);
        } else {
          console.log('Voter updated successfully:', result);
          // Reload the CSV data to get the updated values
          reloadSamherstData();
        }
      } catch (error) {
        console.error('Error updating voter:', error);
        // Revert local state on error
        setSamherstVoters(samherstVoters);
      }
    }
  };


  // Function to convert voters back to CSV format
  const _convertVotersToCSV = (voters: any[]) => {
    if (voters.length === 0) return '';
    
    // Get headers from the first voter
    const headers = Object.keys(voters[0]);
    
    // Create CSV content
    const csvRows = [
      headers.join(','), // Header row
      ...voters.map(voter => 
        headers.map(header => {
          const value = voter[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  // Function to get favicon path based on constituency name
  const getFaviconPath = (constituencyName: string) => {
    const nameMap: { [key: string]: string } = {
      'South Amherst Village': 'samherst',
      'Lorain Municipal Court': 'lorain',
      '2': 'ld2',
      '5': 'ld5',
      '8': 'ld8',
      '11': 'ld11',
      '12': 'ld12',
      '22': 'ld22',
      '24': 'ld24',
      '26': 'ld26',
    };
    
    const folderName = nameMap[constituencyName] || constituencyName.toLowerCase().replace(/\s+/g, '');
    return `${import.meta.env.BASE_URL}voters/${folderName}/favicon.png`;
  };

  // Only show allowed constituencies based on user.portal
  const allowedConstituencies = React.useMemo(() => {
    if (!user) return [];
    if (user.portal === 'LD2') {
      return initialConstituencies.filter(c => c.group === 'LEGISLATIVE DISTRICTS');
    } else if (user.portal === 'Lorain') {
      return initialConstituencies.filter(c => c.group === 'OHIO DISTRICTS' && c.name === 'Lorain Municipal Court');
    } else if (user.portal === 'SouthAmherst') {
      return initialConstituencies.filter(c => c.group === 'OHIO DISTRICTS' && c.name === 'South Amherst Village');
    }
    return [];
  }, [user]);

  // Auto-select constituency if user has only one
  React.useEffect(() => {
    if (allowedConstituencies.length === 1) {
      const constituencyIndex = constituencies.findIndex(c => c === allowedConstituencies[0]);
      if (constituencyIndex !== -1) {
        setSelectedIndex(constituencyIndex);
      }
    }
  }, [allowedConstituencies, constituencies]);

  // Load all LD2 chunked JSON files if LD2 is selected (load all chunks in sequence)
  React.useEffect(() => {
    if (!user) return;
    const selected = constituencies[selectedIndex];
    if (user.portal === 'LD2' && selected.group === "LEGISLATIVE DISTRICTS" && selected.name === "2") {
      const voters: any[] = [];
      let chunkIndex = 1;
      let stop = false;
      const loadChunks = async () => {
        while (!stop) {
          const url = import.meta.env.BASE_URL + `voters/LD2-chunk-${chunkIndex}.json`;
          try {
            const res = await fetch(url);
            if (!res.ok) break;
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) break;
            voters.push(...data);
            chunkIndex++;
          } catch {
            break;
          }
        }
        setLd2Voters(voters);
      };
      loadChunks();
    } else {
      setLd2Voters(null);
    }
  }, [selectedIndex, constituencies, user]);

  // Load all Lorain JSON files if Lorain portal and Lorain Municipal Court is selected
  React.useEffect(() => {
    if (!user) return;
    const selected = constituencies[selectedIndex];
    if (user.portal === 'Lorain' && selected.group === 'OHIO DISTRICTS' && selected.name === 'Lorain Municipal Court') {
      const loadAllPrecincts = async () => {
        try {
          const manifestUrl = import.meta.env.BASE_URL + 'voters/lorain-manifest.json';
          const res = await fetch(manifestUrl);
          if (!res.ok) throw new Error('Manifest not found');
          const files = await res.json();
          console.log('[Lorain Loader] Manifest files:', files);
          if (!Array.isArray(files) || files.length === 0) {
            setLorainVoters([]);
            return;
          }
          let allVoters: any[] = [];
          let totalRaw = 0;
          let totalValid = 0;
          let totalFiller = 0;
          for (const file of files) {
            try {
              const fileUrl = import.meta.env.BASE_URL + 'voters/LorainMunicipalCourt/' + file;
              const fileRes = await fetch(fileUrl);
              if (!fileRes.ok) {
                console.warn(`[Lorain Loader] Failed to fetch file: ${file}`);
                continue;
              }
              const data = await fileRes.json();
              if (Array.isArray(data)) {
                totalRaw += data.length;
                const valid = data.filter(v => v && typeof v === 'object' && !Array.isArray(v) && v.SOS_VOTERID && typeof v.SOS_VOTERID === 'string');
                const filler = data.length - valid.length;
                totalValid += valid.length;
                totalFiller += filler;
                allVoters = allVoters.concat(valid);
                console.log(`[Lorain Loader] File: ${file} - total: ${data.length}, valid: ${valid.length}, filler: ${filler}`);
              } else {
                console.warn(`[Lorain Loader] File: ${file} is not an array`);
              }
            } catch (e) {
              console.warn(`[Lorain Loader] Error loading file: ${file}`, e);
            }
          }
          console.log(`[Lorain Loader] Total raw: ${totalRaw}, total valid: ${totalValid}, total filler: ${totalFiller}`);
          setLorainVoters(allVoters);
        } catch (e) {
          console.error('[Lorain Loader] Error loading manifest or files:', e);
          setLorainVoters([]);
        }
      };
      loadAllPrecincts();
    } else {
      setLorainVoters(null);
    }
  }, [selectedIndex, constituencies, user]);

  // Load Christians CSV data for South Amherst
  React.useEffect(() => {
    if (!user || user.portal !== 'SouthAmherst') {
      setSamherstChristians(null);
      return;
    }

    const loadChristiansCsv = async () => {
      try {
        const csvUrl = import.meta.env.BASE_URL + 'voters/samherst/SAMHERSTchristians.csv';
        const res = await fetch(csvUrl);
        if (!res.ok) throw new Error('Christians CSV file not found');
        const csvText = await res.text();
        
        // Parse CSV
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          setSamherstChristians([]);
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const christians = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const christian: any = {};
          headers.forEach((header, index) => {
            christian[header] = values[index] || '';
          });
          return christian;
        }).filter(christian => christian && Object.keys(christian).length > 0);
        
        console.log(`[South Amherst Christians Loader] Loaded ${christians.length} Christians from CSV`);
        setSamherstChristians(christians);
      } catch (e) {
        console.error('[South Amherst Christians Loader] Error loading CSV:', e);
        setSamherstChristians([]);
      }
    };
    loadChristiansCsv();
  }, [user]);

  // Reload South Amherst data when switching to Constituents or Dial pages
  React.useEffect(() => {
    if (user?.portal === 'SouthAmherst' && (activeMenu === 'Constituents' || activeMenu === 'Dial')) {
      reloadSamherstData();
    }
  }, [activeMenu, user, reloadSamherstData]);

  // Load South Amherst CSV file if South Amherst portal and South Amherst Village is selected
  React.useEffect(() => {
    if (!user) return;
    const selected = constituencies[selectedIndex];
    if (user.portal === 'SouthAmherst' && selected.group === 'OHIO DISTRICTS' && selected.name === 'South Amherst Village') {
      const loadSamherstCsv = async () => {
        try {
          const csvUrl = import.meta.env.BASE_URL + 'voters/csv/SAMHERST.csv';
          const res = await fetch(csvUrl);
          if (!res.ok) throw new Error('CSV file not found');
          const csvText = await res.text();
          
          // Parse CSV
          const lines = csvText.split('\n').filter(line => line.trim());
          if (lines.length === 0) {
            setSamherstVoters([]);
            return;
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const voters = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const voter: any = {};
            headers.forEach((header, index) => {
              voter[header] = values[index] || '';
            });
            return voter;
          }).filter(voter => voter && Object.keys(voter).length > 0);
          
          console.log(`[South Amherst Loader] Loaded ${voters.length} voters from CSV`);
          
          // Match with Christians data if available
          if (samherstChristians && samherstChristians.length > 0) {
            const matchedVoters = matchVoterData(voters, samherstChristians);
            console.log(`[South Amherst Loader] Matched ${matchedVoters.filter(v => v.religion).length} voters with religion/phone data`);
            setSamherstVoters(matchedVoters);
          } else {
            setSamherstVoters(voters);
          }
        } catch (e) {
          console.error('[South Amherst Loader] Error loading CSV:', e);
          setSamherstVoters([]);
        }
      };
      loadSamherstCsv();
    } else {
      setSamherstVoters(null);
    }
  }, [selectedIndex, constituencies, user, samherstChristians]);

  // Filter menu based on user portal
  const menu = React.useMemo(() => {
    const baseMenu = [
      { label: 'Constituents' },
      { label: 'Turf' },
      { label: 'Dial' },
      { label: 'Planner' },
      { label: 'Fundraising' },
      {
        label: 'Amplify',
        sub: ['Press', 'Social Media', 'Ads', 'SMS', 'Email'],
      },
      { label: 'Account' },
    ];

    if (!user) return baseMenu;
    
    return baseMenu.filter(item => {
      // Hide Planner for South Amherst users
      if (user.portal === 'SouthAmherst' && item.label === 'Planner') {
        return false;
      }
      return true;
    });
  }, [user]);

  // Determine which voters to show for Constituents page
  const currentVoters = React.useMemo(() => {
    const selected = constituencies[selectedIndex];
    if (user?.portal === 'LD2' && selected.group === 'LEGISLATIVE DISTRICTS' && selected.name === '2') {
      return ld2Voters ?? [];
    }
    if (user?.portal === 'Lorain' && selected.group === 'OHIO DISTRICTS' && selected.name === 'Lorain Municipal Court') {
      return lorainVoters ?? [];
    }
    if (user?.portal === 'SouthAmherst' && selected.group === 'OHIO DISTRICTS' && selected.name === 'South Amherst Village') {
      return samherstVoters ?? [];
    }
    return [];
  }, [user, constituencies, selectedIndex, ld2Voters, lorainVoters, samherstVoters]);

  // Basic page components for each menu/submenu
  const pages: Record<string, React.ReactElement> = {
    'Constituents': <Constituents voters={currentVoters} onUpdateVoter={updateVoterData} />, 
    'Turf': <Turf />, 
    'Dial': <Dial voters={currentVoters} onUpdateVoter={updateVoterData} />, 
    'Planner': <Planner />, 
    'Fundraising': user ? <Fundraising user={user} /> : <div>Please log in to view fundraising tools.</div>, 
    'Amplify': <Amplify />, 
    'Press': <Press />, 
    'Social Media': <SocialMedia />, 
    'Ads': <Ads />, 
    'SMS': <SMS />, 
    'Email': <Email />, 
    'Account': user ? <Account user={user} /> : <div>Please log in to view account settings.</div>, 
  };

  // Show login if not logged in
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // Only show allowed constituencies in sidebar
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      {/* Top menu - full width header */}
      <nav
        style={{
          background: 'var(--sunbelt-blue)',
          color: 'var(--sunbelt-bg)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          height: 64,
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onMouseLeave={() => { setActiveSub(null); }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'inherit',
          }}
          onClick={() => {
            setActiveMenu('Constituents');
            setActiveSub(null);
          }}
          aria-label="Go to homepage"
        >
          <SunbeltIcon style={{ height: 40, width: 40, marginRight: 16 }} />
          <span style={{ fontWeight: 700, fontSize: 24, marginRight: 32 }}>Sunbelt</span>
        </button>
        <ul style={{ display: 'flex', gap: 24, listStyle: 'none', margin: 0, padding: 0, height: '100%' }}>
          {menu.map((item) => (
            <li
              key={item.label}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}
              onMouseEnter={() => item.sub && setActiveSub(item.label)}
              onMouseLeave={e => {
                // Only close if mouse leaves both parent and dropdown
                const related = e.relatedTarget as Node | null;
                const current = e.currentTarget as Node;
                if (!current.contains(related)) {
                  setActiveSub(null);
                }
              }}
            >
              <button
                className="main-menu-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontWeight: activeMenu === item.label ? 700 : 400,
                  fontSize: 16,
                  cursor: 'pointer',
                  padding: '0 8px',
                  height: '100%',
                  borderBottom: activeMenu === item.label ? '3px solid var(--sunbelt-yellow)' : '3px solid transparent',
                  borderRadius: 0,
                }}
                onClick={() => {
                  setActiveMenu(item.label);
                  setActiveSub(null);
                }}
                aria-haspopup={!!item.sub}
                aria-expanded={activeSub === item.label}
              >
                {item.label}
                {item.sub && (
                  <span style={{ 
                    marginLeft: 6, 
                    fontSize: 12, 
                    transition: 'transform 0.2s',
                    transform: activeSub === item.label ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                )}
              </button>
              {/* Dropdown for submenus */}
              {item.sub && activeSub === item.label && (
                <ul
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'white',
                    color: 'var(--sunbelt-blue)',
                    minWidth: 180,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    zIndex: 10,
                    margin: 0,
                    padding: 0,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                  onMouseLeave={e => {
                    // Only close if mouse leaves both dropdown and parent
                    const related = e.relatedTarget as Node | null;
                    const parent = e.currentTarget.parentElement as Node;
                    if (!parent.contains(related)) {
                      setActiveSub(null);
                    }
                  }}
                >
                  {item.sub.map((sub) => (
                    <li key={sub} style={{ borderBottom: '1px solid #eee', listStyle: 'none' }}>
                      <button
                        className="dropdown-btn"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          fontSize: 15,
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 16px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setActiveMenu(sub);
                          setActiveSub(null);
                        }}
                      >
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar for constituency selection */}
        <aside style={{ width: 260, background: '#f4f4f4', padding: 16 }}>
          <h2>Constituencies</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {allowedConstituencies.map((c) => {
              const idx = constituencies.findIndex(x => x === c);
              return (
                <li key={c.group + c.name}>
                  <button
                    style={{
                      width: '100%',
                      background: idx === selectedIndex ? '#d0eaff' : 'white',
                      border: 'none',
                      padding: 8,
                      textAlign: 'left',
                      cursor: c.selectable ? 'pointer' : 'not-allowed',
                      fontWeight: idx === selectedIndex ? 'bold' : 'normal',
                      opacity: c.selectable ? 1 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => c.selectable && setSelectedIndex(idx)}
                    disabled={!c.selectable}
                  >
                    <span>{c.name}</span>
                    <img 
                      src={getFaviconPath(c.name)} 
                      alt={`${c.name} favicon`}
                      style={{
                        width: 20,
                        height: 20,
                        objectFit: 'contain',
                        opacity: 0.7,
                      }}
                      onError={(e) => {
                        // Hide the image if it fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
        {/* Main content area */}
        <main style={{ flex: 1, padding: 24 }}>
          {/* Show the selected page */}
          {pages[activeMenu ?? 'Constituents']}
        </main>
      </div>
    </div>
  );
}

export default App;
