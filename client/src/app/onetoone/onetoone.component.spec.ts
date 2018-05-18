import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnetooneComponent } from './onetoone.component';

describe('OnetooneComponent', () => {
  let component: OnetooneComponent;
  let fixture: ComponentFixture<OnetooneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnetooneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnetooneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
