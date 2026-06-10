import type { School } from '../types/school';

export type ResearchRequest = {
  schoolName: string;
  homeLocation: string;
  academicInterest: string;
};

export const researchSchool = async (request: ResearchRequest): Promise<Partial<School>> => {
  const response = await fetch('/api/research-school', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'School research could not be completed.');
  }

  return response.json();
};
