import { sampleSchools } from '../data/sampleSchools';
import type { School } from '../types/school';
import type { SchoolRepository } from './schoolRepository';

const STORAGE_KEY = 'portal-board-schools';

const readSchools = (): School[] => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSchools));
    return sampleSchools;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSchools = (schools: School[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schools));
};

export const localStorageSchoolRepository: SchoolRepository = {
  async getAll() {
    return readSchools();
  },
  async getById(id) {
    return readSchools().find((school) => school.id === id) ?? null;
  },
  async create(input) {
    const schools = readSchools();
    writeSchools([input, ...schools]);
    return input;
  },
  async update(id, updates) {
    const schools = readSchools();
    const index = schools.findIndex((school) => school.id === id);
    if (index === -1) {
      throw new Error('School not found');
    }
    const updated = { ...schools[index], ...updates, updatedAt: new Date().toISOString() };
    schools[index] = updated;
    writeSchools(schools);
    return updated;
  },
  async delete(id) {
    writeSchools(readSchools().filter((school) => school.id !== id));
  },
  async replaceAll(schools) {
    writeSchools(schools);
    return schools;
  },
};
