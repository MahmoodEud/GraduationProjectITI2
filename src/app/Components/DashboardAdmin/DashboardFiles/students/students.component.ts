import { Component, inject, OnInit, signal } from '@angular/core';
import { IStudent } from '../../../../Interfaces/istudent';
import { StudentService } from '../../../../Services/student.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { DashboardStats } from '../../../../Interfaces/DashboardStats';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
 private toast = inject(ToastrService);
  private studentService = inject(StudentService);
  private router = inject(Router);
  studentsDelete = signal<any[]>([]);
  students: IStudent[] = [];
  state?: DashboardStats;
  roles: string[] = [];
  errorFormDbStudent: string = '';
  years = [
    { value: 1, label: 'الصف الأول الثانوي' },
    { value: 2, label: 'الصف الثاني الثانوي' },
    { value: 3, label: 'الصف الثالث الثانوي' }
  ];
  selectedYear: number | null = null;
  selectedRole: string | null = null;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;

  ngOnInit(): void {
    this.getStatistics();
    this.getAllStudents();
    this.getRoles();
  }

  getStatistics() {
    this.studentService.getDashboardStats().subscribe({
      next: (data) => {
        this.state = data;
      },
      error: (err) => console.error('Error fetching stats:', err)
    });
  }

  getAllStudents() {
    this.studentService.getAllStudents(
      this.selectedYear ?? undefined,
      (this.selectedRole?.trim()?.length ? this.selectedRole!.trim() : undefined),
      this.pageNumber,
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.students = res.items || [];
        this.totalPages = res.totalPages || Math.ceil(res.totalCount / res.pageSize) || 0;
        this.pageNumber = res.page || 1;
        this.pageSize = res.pageSize || 10;
        if (this.students.length === 0) {
          this.toast.info('لا توجد بيانات للطلاب.');
        }
      },
      error: (err) => {
        this.students = [];
        this.totalPages = 0;
        console.error('Error fetching students:', err);
        if (typeof err.error === 'string') {
          this.toast.error(err.error);
        } else if (err.error?.message || err.error?.title || err.error?.detail) {
          this.toast.error(err.error.message || err.error.title || err.error.detail);
        } else {
          this.toast.error(`${err.status} - ${err.statusText}`);
        }
      }
    });
  }

  getRoles() {
    this.studentService.getRoles().subscribe({
      next: (res) => {
        this.roles = res;      },
      error: (err) => {
        console.error('Error fetching roles:', err);
        if (err.error?.message) {
          this.toast.error(err.error.message);
        }
      }
    });
  }

  onYearChange() {
    this.pageNumber = 1;
    this.getAllStudents();
  }

  onRoleChange() {
    this.pageNumber = 1;
    this.getAllStudents();
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
            this.getAllStudents();
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.getAllStudents();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.getAllStudents();
    }
  }

  onDelete(id: string) {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا الطالب؟')) {
      this.studentService.deleteStudentById(id).subscribe({
        next: () => {
          this.toast.success('تم الحذف بنجاح');
          this.getAllStudents();
        },
        error: (err) => {
          this.toast.error('حدث خطأ أثناء الحذف');
          console.error('Error deleting student:', err);
        }
      });
    }
  }
}
