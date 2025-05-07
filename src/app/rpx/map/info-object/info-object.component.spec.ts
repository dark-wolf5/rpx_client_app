import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {InfoObjectComponent} from './info-object.component';

describe('InfoObjectComponent', () => {
  let component: InfoObjectComponent;
  let fixture: ComponentFixture<InfoObjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InfoObjectComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
