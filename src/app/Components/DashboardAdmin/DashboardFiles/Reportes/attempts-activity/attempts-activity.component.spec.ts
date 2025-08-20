import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptsActivityComponent } from './attempts-activity.component';

describe('AttemptsActivityComponent', () => {
  let component: AttemptsActivityComponent;
  let fixture: ComponentFixture<AttemptsActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptsActivityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttemptsActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
