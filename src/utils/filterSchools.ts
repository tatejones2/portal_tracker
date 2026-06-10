import type { Priority, RecruitingStatus, School, UnknownBoolean } from '../types/school';

export type SchoolFilters = {
  query: string;
  status: 'all' | RecruitingStatus;
  offer: 'all' | 'yes' | 'no';
  undergradCS: 'all' | Extract<UnknownBoolean, boolean> | 'unknown';
  gradCS: 'all' | Extract<UnknownBoolean, boolean> | 'unknown';
  priority: 'all' | Priority;
  conference: string;
  wishlistOnly: boolean;
  needsFollowUp: boolean;
};

export const defaultFilters: SchoolFilters = {
  query: '',
  status: 'all',
  offer: 'all',
  undergradCS: 'all',
  gradCS: 'all',
  priority: 'all',
  conference: 'all',
  wishlistOnly: false,
  needsFollowUp: false,
};

export const needsFollowUp = (school: School) => {
  const today = new Date().toISOString().slice(0, 10);
  if (school.priority === 'High') return true;
  if (school.nextFollowUpDate && school.nextFollowUpDate <= today) return true;
  if (school.status === 'Pending Response') return true;
  if (school.status === 'Texting' && school.lastContactDate) {
    const then = new Date(`${school.lastContactDate}T12:00:00`).getTime();
    const days = (Date.now() - then) / 86400000;
    return days >= 3;
  }
  return false;
};

const matchesUnknownBoolean = (value: UnknownBoolean | undefined, filter: SchoolFilters['undergradCS']) => {
  if (filter === 'all') return true;
  return (value ?? 'unknown') === filter;
};

export const filterSchools = (schools: School[], filters: SchoolFilters) => {
  const query = filters.query.trim().toLowerCase();
  return schools.filter((school) => {
    const haystack = [
      school.name,
      school.city,
      school.state,
      school.fullLocation,
      school.baseballConference,
      school.status,
      school.notes,
      ...(school.contacts ?? []).map((contact) => contact.name),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (query && !haystack.includes(query)) return false;
    if (filters.status !== 'all' && school.status !== filters.status) return false;
    if (filters.offer === 'yes' && !(school.offer?.hasOffer || school.status === 'Offer')) return false;
    if (filters.offer === 'no' && (school.offer?.hasOffer || school.status === 'Offer')) return false;
    if (!matchesUnknownBoolean(school.hasUndergradCS, filters.undergradCS)) return false;
    if (!matchesUnknownBoolean(school.hasGradCS, filters.gradCS)) return false;
    if (filters.priority !== 'all' && school.priority !== filters.priority) return false;
    if (filters.conference !== 'all' && school.baseballConference !== filters.conference) return false;
    if (filters.wishlistOnly && !(school.isWishlist || school.status === 'Wishlist')) return false;
    if (filters.needsFollowUp && !needsFollowUp(school)) return false;
    return true;
  });
};
