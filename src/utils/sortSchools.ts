import type { School } from '../types/school';

export type SortKey =
  | 'name'
  | 'status'
  | 'offer'
  | 'cost'
  | 'undergradCS'
  | 'gradCS'
  | 'conference'
  | 'record'
  | 'driveTime'
  | 'lastContactDate'
  | 'nextFollowUpDate'
  | 'priority'
  | 'createdAt'
  | 'updatedAt';

export type SortDirection = 'asc' | 'desc';

const priorityRank = { High: 3, Medium: 2, Low: 1 };

const valueForSort = (school: School, key: SortKey): string | number => {
  switch (key) {
    case 'offer':
      return school.offer?.hasOffer || school.status === 'Offer' ? 1 : 0;
    case 'cost':
      return school.estimatedCostOfAttendance ?? school.tuitionOutOfState ?? school.tuitionInState ?? 999999999;
    case 'undergradCS':
      return school.hasUndergradCS === true ? 2 : school.hasUndergradCS === false ? 0 : 1;
    case 'gradCS':
      return school.hasGradCS === true ? 3 : school.hasGradCS === 'related' ? 2 : school.hasGradCS === false ? 0 : 1;
    case 'conference':
      return school.baseballConference ?? '';
    case 'record':
      return school.baseball2026Record ?? '';
    case 'driveTime':
      return school.driveTimeFromBurlingtonNC ?? '';
    case 'priority':
      return school.priority ? priorityRank[school.priority] : 0;
    default:
      return school[key] ?? '';
  }
};

export const sortSchools = (schools: School[], key: SortKey, direction: SortDirection) => {
  return [...schools].sort((a, b) => {
    const left = valueForSort(a, key);
    const right = valueForSort(b, key);
    const result =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
    return direction === 'asc' ? result : -result;
  });
};
