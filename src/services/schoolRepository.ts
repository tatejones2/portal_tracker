import type { School } from '../types/school';

export interface SchoolRepository {
  getAll(): Promise<School[]>;
  getById(id: string): Promise<School | null>;
  create(input: School): Promise<School>;
  update(id: string, updates: Partial<School>): Promise<School>;
  delete(id: string): Promise<void>;
  replaceAll(schools: School[]): Promise<School[]>;
}
