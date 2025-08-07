import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalFileComponent } from './personal-file.component';

describe('PersonalFileComponent', () => {
  let component: PersonalFileComponent;
  let fixture: ComponentFixture<PersonalFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
