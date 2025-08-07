import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PDFsComponent } from './pdfs.component';

describe('PDFsComponent', () => {
  let component: PDFsComponent;
  let fixture: ComponentFixture<PDFsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PDFsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PDFsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
