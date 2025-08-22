import { Component, OnInit } from '@angular/core';
import { StudentCourseService } from '../../../../Services/student-course.service';
import { CourseService } from '../../../../Services/course.service';
import { StudentService } from '../../../../Services/student.service';
import { Course } from '../../../../Interfaces/ICourse';
import { IStudent } from '../../../../Interfaces/istudent';
import { IPagedResult } from '../../../../Interfaces/ipaged-result';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminEnrollInvoiceComponent } from "./admin-enroll-invoice/admin-enroll-invoice.component";
import { AdminInvoicesListComponent } from "./admin-invoices-list/admin-invoices-list.component";

@Component({
  selector: 'app-admin-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminEnrollInvoiceComponent, AdminInvoicesListComponent],
  templateUrl: './admin-course-management.component.html',
  styleUrls: ['./admin-course-management.component.css']
})
export class AdminCourseManagementComponent implements OnInit {
  students: IStudent[] = [];
  courses: Course[] = [];
  selectedStudentId: number | null = null; 
  selectedCourseId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private studentCourseService: StudentCourseService,
    private courseService: CourseService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.studentService.getAllStudents().subscribe({
      next: (response: IPagedResult<IStudent>) => this.students = response.items,
      error: () => this.errorMessage = 'فشل تحميل الطلاب'
    });

    this.courseService.getCourses().subscribe({
      next: (response: IPagedResult<Course>) => this.courses = response.items,
      error: () => this.errorMessage = 'فشل تحميل الكورسات'
    });
  }

  enrollStudent(): void {
    if (!this.isSelectionValid()) return;

    this.studentCourseService.adminEnroll(this.selectedStudentId!, this.selectedCourseId!).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (err) => this.handleError(err, 'فشل تسجيل الطالب')
    });
  }

  unenrollStudent(): void {
    if (!this.isSelectionValid()) return;

    this.studentCourseService.adminUnenroll(this.selectedStudentId!, this.selectedCourseId!).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (err) => this.handleError(err, 'فشل إلغاء تسجيل الطالب')
    });
  }

  private isSelectionValid(): boolean {
    if (!this.selectedStudentId || !this.selectedCourseId) {
      this.errorMessage = 'من فضلك اختر طالب وكورس';
      this.successMessage = null;
      return false;
    }
    return true;
  }

  private handleSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;
  }

  private handleError(err: any, fallback: string): void {
    this.errorMessage = err.message || fallback;
    this.successMessage = null;
  }
}