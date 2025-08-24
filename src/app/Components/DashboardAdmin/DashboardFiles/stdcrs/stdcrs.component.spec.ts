import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StdcrsComponent } from './stdcrs.component';

describe('StdcrsComponent', () => {
  let component: StdcrsComponent;
  let fixture: ComponentFixture<StdcrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StdcrsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StdcrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
