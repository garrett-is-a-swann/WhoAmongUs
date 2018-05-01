import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnetomanyComponent } from './onetomany.component';

describe('OnetomanyComponent', () => {
  let component: OnetomanyComponent;
  let fixture: ComponentFixture<OnetomanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnetomanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnetomanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
