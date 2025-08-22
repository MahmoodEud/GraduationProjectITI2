import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentReportDetailsComponent } from './student-report-details.component';

describe('StudentReportDetailsComponent', () => {
  let component: StudentReportDetailsComponent;
  let fixture: ComponentFixture<StudentReportDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentReportDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
