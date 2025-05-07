import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {MenuLoggedInComponent} from './menu-logged-in.component';

describe('MenuLoggedInComponent', () => {
  let component: MenuLoggedInComponent;
  let fixture: ComponentFixture<MenuLoggedInComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MenuLoggedInComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuLoggedInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
