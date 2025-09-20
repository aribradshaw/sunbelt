/**
 * South Amherst data parsing utilities
 * Handles specific formatting rules for South Amherst Village voter data
 */

export interface ParsedVoter {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  address: string;
  city: string;
  zip: string;
  party: string;
  lastVote: string;
  religion: string;
  phoneMain: string;
  phoneType: string;
  phone2: string;
  phone3: string;
  allPhones: string[];
  // Status fields
  knockedDoor: boolean;
  voterStatus: string;
  voterCalled: boolean;
  voterTexted: boolean;
  leftPamphlet: boolean;
  voterMailed: boolean;
  voter: Record<string, string | number | undefined>;
}

/**
 * Parse last voted date according to South Amherst rules
 * - Show just year for most dates
 * - Show "May 2025" for 5/6/2025 dates
 * - Return "Never Voted" for empty/null values
 */
export function parseLastVotedDate(lastVote: string | number | undefined): string {
  if (!lastVote || lastVote === '' || lastVote === '0') return 'Never Voted';
  
  const dateStr = String(lastVote);
  
  // Special case for May 2025
  if (dateStr.includes('5/6/2025')) {
    return 'May 2025';
  }
  
  // For all other dates, extract just the year
  const year = dateStr.split('/').pop();
  return year || 'Never Voted';
}

/**
 * Parse party affiliation for display
 * Maps database values to display-friendly format
 */
export function parsePartyAffiliation(party: string | number | undefined): string {
  if (!party) return '';
  return String(party);
}

/**
 * Check if a voter has a party affiliation that should show an icon
 */
export function hasPartyIcon(party: string | number | undefined): boolean {
  const partyStr = String(party || '');
  return partyStr === 'REP' || partyStr === 'DEM' || partyStr === 'G';
}

/**
 * Get the appropriate icon for a party affiliation
 */
export function getPartyIcon(party: string | number | undefined): string {
  const partyStr = String(party || '');
  
  switch (partyStr) {
    case 'REP':
      return 'republican';
    case 'DEM':
      return 'democrat';
    case 'G':
      return 'green';
    default:
      return '';
  }
}

/**
 * Parse status field from CSV (X, x, or empty)
 */
export function parseStatusField(value: string | number | undefined): boolean {
  const str = String(value || '').toLowerCase();
  return str === 'x';
}

/**
 * Parse voter status field
 */
export function parseVoterStatus(value: string | number | undefined): string {
  return String(value || '');
}

/**
 * Parse a voter record into the standardized format
 */
export function parseVoterRecord(voter: Record<string, string | number | undefined>): ParsedVoter {
  return {
    firstName: String(voter.FIRSTN || ''),
    middleName: String(voter.MIDDLEN || ''),
    lastName: String(voter.LASTN || ''),
    fullName: `${String(voter.FIRSTN || '')} ${String(voter.MIDDLEN || '')} ${String(voter.LASTN || '')}`.trim().replace(/\s+/g, ' '),
    address: `${String(voter.STNUM || '')} ${String(voter.STDIR || '')} ${String(voter.STNAME || '')}`.trim().replace(/\s+/g, ' '),
    city: String(voter.CITY || ''),
    zip: String(voter.ZIP || ''),
    party: parsePartyAffiliation(voter.PARTYAFFIL),
    lastVote: parseLastVotedDate(voter.LASTVOTE),
    religion: String(voter.religion || ''),
    phoneMain: String(voter.phoneMain || ''),
    phoneType: String(voter.phoneType || ''),
    phone2: String(voter.phone2 || ''),
    phone3: String(voter.phone3 || ''),
    allPhones: Array.isArray(voter.allPhones) ? voter.allPhones : [],
    // Status fields
    knockedDoor: parseStatusField(voter['Knocked Door']),
    voterStatus: parseVoterStatus(voter['Voter Status']),
    voterCalled: parseStatusField(voter['Voter Called']),
    voterTexted: parseStatusField(voter['Voter Texted']),
    leftPamphlet: parseStatusField(voter['Left Pamphlet']),
    voterMailed: parseStatusField(voter['Voter Mailed']),
    voter: voter
  };
}

/**
 * Filter voters based on search criteria
 */
export function filterVoters(voters: ParsedVoter[], search: string): ParsedVoter[] {
  if (!search) return voters;
  
  const searchLower = search.toLowerCase();
  
  return voters.filter(voter => 
    voter.fullName.toLowerCase().includes(searchLower) ||
    voter.address.toLowerCase().includes(searchLower) ||
    voter.city.toLowerCase().includes(searchLower) ||
    voter.party.toLowerCase().includes(searchLower) ||
    voter.religion.toLowerCase().includes(searchLower) ||
    voter.phoneMain.includes(search) ||
    voter.phone2.includes(search) ||
    voter.phone3.includes(search)
  );
}

/**
 * Sort voters by last name, then first name
 */
export function sortVoters(voters: ParsedVoter[]): ParsedVoter[] {
  return [...voters].sort((a, b) => {
    const lastNameCompare = a.lastName.localeCompare(b.lastName);
    if (lastNameCompare !== 0) return lastNameCompare;
    return a.firstName.localeCompare(b.firstName);
  });
}
