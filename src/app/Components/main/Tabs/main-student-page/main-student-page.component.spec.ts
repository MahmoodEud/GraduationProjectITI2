import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainStudentPageComponent } from './main-student-page.component';

describe('MainStudentPageComponent', () => {
  let component: MainStudentPageComponent;
  let fixture: ComponentFixture<MainStudentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainStudentPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
