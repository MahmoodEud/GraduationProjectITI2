export interface CourseStats {
  total: number;
  available: number;
  unavailable: number;
  free: number;
  paid: number;
  byYear: { [key: string]: number };
}