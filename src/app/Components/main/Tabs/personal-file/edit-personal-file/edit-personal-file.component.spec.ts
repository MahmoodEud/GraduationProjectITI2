import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPersonalFileComponent } from './edit-personal-file.component';

describe('EditPersonalFileComponent', () => {
  let component: EditPersonalFileComponent;
  let fixture: ComponentFixture<EditPersonalFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPersonalFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPersonalFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
