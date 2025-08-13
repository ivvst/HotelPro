import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotifyDropdownComponent } from './notify-dropdown.component';



describe('NotifyDropdownComponent', () => {
  let component: NotifyDropdownComponent;
  let fixture: ComponentFixture<NotifyDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotifyDropdownComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NotifyDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
