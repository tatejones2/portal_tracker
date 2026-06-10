import { useCallback, useEffect, useMemo, useState } from 'react';
import { localStorageSchoolRepository } from '../services/localStorageSchoolRepository';
import type { School } from '../types/school';

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `school-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const prepareSchool = (input: Partial<School>): School => {
  const now = new Date().toISOString();
  return {
    id: input.id || createId(),
    name: input.name?.trim() || 'Untitled School',
    status: input.status || 'Not Contacted',
    priority: input.priority || 'Medium',
    hasUndergradCS: input.hasUndergradCS ?? 'unknown',
    hasGradCS: input.hasGradCS ?? 'unknown',
    costTypeUsed: input.costTypeUsed ?? 'unknown',
    offer: input.offer ?? { hasOffer: false },
    contacts: input.contacts ?? [],
    aiSources: input.aiSources ?? [],
    createdAt: input.createdAt || now,
    updatedAt: now,
    ...input,
  };
};

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await localStorageSchoolRepository.getAll();
    setSchools(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const actions = useMemo(
    () => ({
      async create(input: Partial<School>) {
        const school = prepareSchool(input);
        await localStorageSchoolRepository.create(school);
        await refresh();
        return school;
      },
      async update(id: string, updates: Partial<School>) {
        const school = await localStorageSchoolRepository.update(id, updates);
        await refresh();
        return school;
      },
      async remove(id: string) {
        await localStorageSchoolRepository.delete(id);
        await refresh();
      },
      async replaceAll(nextSchools: School[]) {
        const normalized = nextSchools.map((school) => prepareSchool(school));
        await localStorageSchoolRepository.replaceAll(normalized);
        await refresh();
      },
      async merge(nextSchools: School[]) {
        const existing = await localStorageSchoolRepository.getAll();
        const byId = new Map(existing.map((school) => [school.id, school]));
        nextSchools.forEach((school) => byId.set(school.id || createId(), prepareSchool(school)));
        await localStorageSchoolRepository.replaceAll(Array.from(byId.values()));
        await refresh();
      },
      async clear() {
        await localStorageSchoolRepository.replaceAll([]);
        await refresh();
      },
    }),
    [refresh],
  );

  return { schools, isLoading, ...actions };
};
