import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../../../Services/student.service';
import { IStudent } from '../../../../../Interfaces/istudent';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.css'
})
export class StudentDetailsComponent implements OnInit {
 // !
  student?: IStudent;
  isLoading = true;
  errorMsg: string | null = null;
  // ! injects
  private route=inject(ActivatedRoute);
  private router=inject(Router);
  private studentSv=inject(StudentService);

  ngOnInit(): void {
     const id=this.route.snapshot.paramMap.get('id');
     console.log('isLoading:', this.isLoading);
console.log('student:', this.student);
      if (!id) {
        this.errorMsg = 'المعرف غير صالح';
        this.isLoading = false;
        return;
      }
     this.studentSv.getStudentById(id).subscribe({
      next: s =>{this.student=s,this.isLoading=false},
      error: (err) => {
        if (typeof err.error === 'string') {
          this.errorMsg = err.error;
        }
        else if (typeof err.error === 'object') {
          this.errorMsg = JSON.stringify(err.error, null, 2);
        }
        else {
          this.errorMsg = `${err.status} - ${err.statusText}`;
        }

        this.isLoading = false;
      }     }
    
    )

  }

  back() { this.router.navigate(['/admin/users']); }
}
