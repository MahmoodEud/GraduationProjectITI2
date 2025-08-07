import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnecalSupportComponent } from './technecal-support.component';

describe('TechnecalSupportComponent', () => {
  let component: TechnecalSupportComponent;
  let fixture: ComponentFixture<TechnecalSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnecalSupportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnecalSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
