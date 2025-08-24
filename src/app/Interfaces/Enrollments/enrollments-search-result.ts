import { EnrollmentListItemDto } from "./enrollment-list-item-dto";
import { EnrollmentStatsDto } from "./enrollment-stats-dto";

export interface EnrollmentsSearchResult {
  items: EnrollmentListItemDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  stats: EnrollmentStatsDto;
}