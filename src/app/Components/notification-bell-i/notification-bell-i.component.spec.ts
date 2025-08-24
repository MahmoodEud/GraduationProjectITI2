import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationBellIComponent } from './notification-bell-i.component';

describe('NotificationBellIComponent', () => {
  let component: NotificationBellIComponent;
  let fixture: ComponentFixture<NotificationBellIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationBellIComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationBellIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
