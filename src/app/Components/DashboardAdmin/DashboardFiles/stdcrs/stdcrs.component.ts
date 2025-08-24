import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { EnrollmentFilter } from '../../../../Interfaces/Enrollments/enrollment-filter'; 
import { EnrollmentsSearchResult } from '../../../../Interfaces/Enrollments/enrollments-search-result'; 
import { environment } from '../../../../Services/register/environment'; 
import { EnrollmentsService } from '../../../../Services/Enrollments/enrollments.service';
type AccessType = 'free' | 'paid' | 'granted';

@Component({
  selector: 'app-stdcrs',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './stdcrs.component.html',
  styleUrls: ['./stdcrs.component.css']
})
export class StdCrsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly enrollmentsApi = inject(EnrollmentsService);

  private readonly apiBase = environment.apiUrl.replace(/\/+$/, ''); 
  private readonly courseApi = `${this.apiBase}/Course`;

  result?: EnrollmentsSearchResult;
  loading = false;
  error: string | null = null;

  filter: EnrollmentFilter = {
    search: '',
    studentYear: undefined,
    courseId: undefined,
    category: '',
    accessType: undefined,        
    dateFrom: undefined,
    dateTo: undefined,
    page: 1,
    pageSize: 20,
    sortBy: 'enrolledAt',
    sortDir: 'desc'
  };

  years = [
    { label: 'الصف الأول الثانوي', value: 0 },
    { label: 'الصف الثاني الثانوي', value: 1 },
    { label: 'الصف الثالث الثانوي', value: 2 },
  ];

  accessTypes: Array<{ label: string; value: AccessType | undefined }> = [
    { label: 'الكل', value: undefined },
    { label: 'مجاني', value: 'free' },
    { label: 'مدفوع', value: 'paid' },
    { label: 'مَمنوح', value: 'granted' },
  ];

  sortOptions = [
    { label: 'تاريخ الاشتراك', value: 'enrolledAt' },
    { label: 'اسم الطالب', value: 'studentName' },
    { label: 'اسم الكورس', value: 'courseTitle' },
    { label: 'السعر', value: 'price' },
  ];

  sortDirs = [
    { label: 'تصاعدي', value: 'asc' },
    { label: 'تنازلي', value: 'desc' },
  ];

  courses: Array<{ id: number; title: string }> = [];

  ngOnInit(): void {
    this.loadCourses();
    this.search();
  }

  get rows() {
    return this.result?.items ?? [];
  }
  get totalCount() {
    return this.result?.totalCount ?? 0;
  }
  get totalPages() {
    return this.result?.totalPages ?? 0;
  }
  get stats() {
    return this.result?.stats;
  }

  applyFilter(): void {
    this.filter.page = 1;
    this.search();
  }
  clearFilter(): void {
    this.filter = {
      search: '',
      studentYear: undefined,
      courseId: undefined,
      category: '',
      accessType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1,
      pageSize: 20,
      sortBy: 'enrolledAt',
      sortDir: 'desc'
    };
    this.search();
  }

  search(): void {
    this.loading = true;
    this.error = null;

    this.enrollmentsApi.search(this.filter).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'فشل تحميل البيانات';
        this.loading = false;
      }
    });
  }

  changePage(p: number): void {
    if (!this.result) return;
    if (p < 1 || p > this.result.totalPages) return;
    this.filter.page = p;
    this.search();
  }

  private loadCourses(): void {
    const params = new HttpParams().set('page', '1').set('pageSize', '100');

    this.http.get<any>(this.courseApi, { params }).subscribe({
      next: (res) => {
        const items = Array.isArray(res?.items) ? res.items : [];
        this.courses = items.map((c: any) => ({ id: c.id, title: c.title }));
      },
      error: () => {
        this.courses = []; 
      }
    });
  }

  trackByIndex = (i: number) => i;
  trackById = (_: number, item: { id: number }) => item.id;
}
