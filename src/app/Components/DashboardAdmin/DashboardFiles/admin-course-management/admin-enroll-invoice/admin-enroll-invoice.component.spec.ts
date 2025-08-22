import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEnrollInvoiceComponent } from './admin-enroll-invoice.component';

describe('AdminEnrollInvoiceComponent', () => {
  let component: AdminEnrollInvoiceComponent;
  let fixture: ComponentFixture<AdminEnrollInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEnrollInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminEnrollInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
