export type RecruitingStatus =
  | 'Wishlist'
  | 'Not Contacted'
  | 'Pending Response'
  | 'Texting'
  | 'Call Scheduled'
  | 'Called'
  | 'Visit Scheduled'
  | 'Visited'
  | 'Offer'
  | 'Committed'
  | 'Passed'
  | 'No Longer Interested';

export type Priority = 'High' | 'Medium' | 'Low';
export type UnknownBoolean = boolean | 'unknown';
export type Confidence = 'High' | 'Medium' | 'Low';

export type OfferDetails = {
  hasOffer: boolean;
  offerDate?: string;
  scholarshipType?: 'Full' | 'Partial' | 'Walk-on' | 'Unknown';
  scholarshipAmount?: string;
  academicAid?: string;
  rosterRole?: string;
  pitchingRole?: string;
  housingIncluded?: UnknownBoolean;
  importantConditions?: string;
  deadline?: string;
  notes?: string;
};

export type SchoolContact = {
  id: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  twitterX?: string;
  notes?: string;
};

export type ResearchSource = {
  title: string;
  url: string;
  fieldSupported?: string;
};

export type School = {
  id: string;
  name: string;
  logoUrl?: string;
  city?: string;
  state?: string;
  fullLocation?: string;
  schoolWebsite?: string;
  athleticsWebsite?: string;
  tuitionInState?: number;
  tuitionOutOfState?: number;
  estimatedCostOfAttendance?: number;
  costTypeUsed?: 'in-state' | 'out-of-state' | 'unknown';
  costNotes?: string;
  hasUndergradCS?: UnknownBoolean;
  undergradCSProgramName?: string;
  undergradCSUrl?: string;
  hasGradCS?: UnknownBoolean;
  gradCSProgramName?: string;
  gradCSUrl?: string;
  baseballConference?: string;
  baseballDivision?: string;
  baseball2026Record?: string;
  baseballRecordSourceUrl?: string;
  driveTimeFromBurlingtonNC?: string;
  driveDistanceFromBurlingtonNC?: string;
  mapsUrl?: string;
  status: RecruitingStatus;
  priority?: Priority;
  isWishlist?: boolean;
  contacts?: SchoolContact[];
  offer?: OfferDetails;
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  aiResearchSummary?: string;
  aiSources?: ResearchSource[];
  confidence?: Confidence;
  createdAt: string;
  updatedAt: string;
};

export const recruitingStatuses: RecruitingStatus[] = [
  'Wishlist',
  'Not Contacted',
  'Pending Response',
  'Texting',
  'Call Scheduled',
  'Called',
  'Visit Scheduled',
  'Visited',
  'Offer',
  'Committed',
  'Passed',
  'No Longer Interested',
];

export const priorities: Priority[] = ['High', 'Medium', 'Low'];
