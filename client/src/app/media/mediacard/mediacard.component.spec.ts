/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MediacardComponent } from './mediacard.component';

describe('MediacardComponent', () => {
  let component: MediacardComponent;
  let fixture: ComponentFixture<MediacardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediacardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediacardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
