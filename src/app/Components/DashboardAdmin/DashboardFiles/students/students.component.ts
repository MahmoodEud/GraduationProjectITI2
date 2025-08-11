import { Component, inject, OnInit, signal } from '@angular/core';
import { IStudent } from '../../../../Interfaces/istudent';
import { StudentService } from '../../../../Services/student.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { DashboardStats } from '../../../../Interfaces/dashboard-stats';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  // !Injects
  private toast=inject(ToastrService)
  private studentService = inject(StudentService);
  private api = inject(StudentService);
  // private dashboard=inject()
  studentsDelete = signal<any[]>([]);
// ! initilization
students:IStudent[]=[];
state?:DashboardStats;
roles: string[] = [];
errorFormDbStudnet:string=''
years = [
  { value: 1, label: 'الصف الأول الثانوي' },
  { value: 2, label: 'الصف الثاني الثانوي' },
  { value: 3, label: 'الصف الثالث الثانوي' }
];
  selectedYear: number | null = null;   // null = الكل
  selectedRole: string | null = null;   // null = الكل

pageNumber = 1;
pageSize = 10;
totalPages = 0

//********************************* */
ngOnInit(): void {

this.getStatistics();
this.getAllStudents();
this.getRoles();
}
// ! Statistics
getStatistics(){
this.studentService.getDashboardStats().subscribe({
  next:(data)=>{
    this.state=data
    
  },
  error: (err) => console.error(err)
})
}
// !Students
getAllStudents(){
   console.log('year=', this.selectedYear, 'role=', this.selectedRole); // تشيك سريع
  this.studentService.getAllStudents(
    this.selectedYear ?? undefined,
    (this.selectedRole?.trim()?.length ? this.selectedRole!.trim() : undefined),
    this.pageNumber,
    this.pageSize
  ).subscribe({
    next:res => {
    this.students = res.items;
    this.totalPages = res.totalPages;  
  },
 error: (err) => {
  this.students = [];
  this.totalPages = 0;

  if (typeof err.error === 'string') {
    this.toast.error(err.error);
  } 
  else if (err.error?.message || err.error?.title || err.error?.detail) {
    this.toast.error(err.error.message || err.error.title || err.error.detail);
  } 
  else {
    this.toast.error(`${err.status} - ${err.statusText}`);
  }
}

  });
}
// !Role
  getRoles() {
    this.studentService.getRoles().subscribe({
      next:res => { this.roles = res;},
   error: err => {
      console.error('Error fetching roles:', err); 
      if (err.error?.message) {
        console.error('Server message:', err.error.message);
      }
   }}
    );
  }
// !pages changes Function
  onYearChange() {
    this.pageNumber = 1;
    this.getAllStudents();
  }
// !Role changes Function
  onRoleChange() {
    this.pageNumber = 1;
    this.getAllStudents();
  }
// !next Page In Pagination (Function)
nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.getAllStudents();
    }
  }
// !prev Page  In Pagination (Function)
  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
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
        console.error(err);
      }
    });
  }
}



}



