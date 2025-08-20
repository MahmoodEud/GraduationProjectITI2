import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentDifficultyComponent } from './assessment-difficulty.component';

describe('AssessmentDifficultyComponent', () => {
  let component: AssessmentDifficultyComponent;
  let fixture: ComponentFixture<AssessmentDifficultyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentDifficultyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssessmentDifficultyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
