import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteGridComponent } from './infinite-grid.component';

describe('InfiniteGridComponent', () => {
  let component: InfiniteGridComponent;
  let fixture: ComponentFixture<InfiniteGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfiniteGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfiniteGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
