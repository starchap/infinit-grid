import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import Debounce from 'debounce-decorator';

export type GridRange = {
  begin: number;
  end: number;
  min: number;
  max: number;
}

@Component({
  selector: 'app-infinite-grid',
  templateUrl: './infinite-grid.component.html',
  styleUrls: ['./infinite-grid.component.css']
})
export class InfiniteGridComponent<E, H> implements OnInit {
  @Input() headers: H[] = [];
  @Input() elements: E[] = [];
  @Input() standardWidth: number = 100;
  @Input() standardHeight: number = 20;
  @Input() preRender: number = 2;

  @Output() verticalEndReached: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() horizontalEndReached: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() headerRange: EventEmitter<H[]> = new EventEmitter<H[]>();

  verticalScrollPosition: BehaviorSubject<GridRange> = new BehaviorSubject<GridRange>(this.getDefaultGridRange());
  horizontalScrollPosition: BehaviorSubject<GridRange> = new BehaviorSubject<GridRange>(this.getDefaultGridRange());
  @ContentChild('header')
  headerTemplate: TemplateRef<ElementRef> | null = null;
  @ContentChild('content')
  contentTemplate: TemplateRef<ElementRef> | null = null;
/*  @ViewChild('infiniteGridContainer')
  infiniteGridContainer: ElementRef | null = null;*/
  @ViewChild('infiniteGridContainer')
  set infiniteGridContainer(infiniteGridContainer: ElementRef){
    this.verticalScrollPosition.next(this.getDefaultGridRange('vertical', this.verticalScrollPosition.value, infiniteGridContainer));
    this.horizontalScrollPosition.next(this.getDefaultGridRange('horizontal', this.horizontalScrollPosition.value, infiniteGridContainer));
  }

  verticalRang: Subject<GridRange> = new Subject<GridRange>();
  horizontalRange: Subject<GridRange> = new Subject<GridRange>();

  translateHorizontal: number = 0;
  translateVertical: number = 0;

  get gridColumnWidth(): number {
    return (this.headers.length * this.standardWidth) - this.translateHorizontal;
  }

  get gridColumnHeight(): number {
    return (this.elements.length * this.standardHeight) - this.translateVertical;
  }

  getHeaderRange$: Observable<H[]> = this.horizontalRange.pipe(
    tap(gridRange => this.translateHorizontal = gridRange.begin * this.standardWidth),
    map(gridRange => {
      const min: number = gridRange.begin < gridRange.min ? gridRange.min : gridRange.begin;
      const max: number = gridRange.max < gridRange.end ? gridRange.max : gridRange.end;
      return [...this.headers].slice(min, max);
    }),
    tap(headerRange => this.headerRange.emit(headerRange)),
  );

  elementRange$: Observable<E[]> = this.verticalRang.pipe(
    tap(gridRange => this.translateVertical = gridRange.begin * this.standardHeight),
    map(gridRange => [...this.elements].slice(gridRange.begin, gridRange.end))
  );

  private lastWindowWidth: number = 0;
  private lastWindowHeight: number = 0;

  ngOnInit(): void {
    this.initRangeListener(this.verticalScrollPosition, this.verticalEndReached, this.verticalRang, this.standardHeight);
    this.initRangeListener(this.horizontalScrollPosition, this.horizontalEndReached, this.horizontalRange, this.standardWidth);
  }
/*

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.sizeIncrease(this.lastWindowHeight, event.target.innerHeight, this.verticalScrollPosition);
    this.sizeIncrease(this.lastWindowWidth, event.target.innerWidth, this.horizontalScrollPosition);
    this.lastWindowWidth = event.target.innerWidth;
    this.lastWindowHeight = event.target.innerHeight;
  }

  sizeIncrease(lastDimension: number, currentDimension: number, trigger: BehaviorSubject<GridRange>): void {
    if (currentDimension > lastDimension) {
/!*      const bla: number = currentDimension - lastDimension;
      trigger.next({...trigger.value, end: trigger.value.end + bla, max: trigger.value.max + bla});*!/
      trigger.next(this.getDefaultGridRange(trigger === this.verticalScrollPosition?'vertical':'horizontal', trigger.value));
    }
  }
*/

/*
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(this.sizeIncrease(this.lastWindowHeight, event.target.innerHeight)){
      this.verticalScrollPosition.next(this.getDefaultGridRange('vertical', this.verticalScrollPosition.value))
    }
    if(this.sizeIncrease(this.lastWindowWidth, event.target.innerWidth)){
      this.horizontalScrollPosition.next(this.getDefaultGridRange('horizontal', this.horizontalScrollPosition.value))
    }
    this.lastWindowWidth = event.target.innerWidth;
    this.lastWindowHeight = event.target.innerHeight;
  }

  sizeIncrease(lastDimension: number, currentDimension: number): boolean {
    if (currentDimension > lastDimension) {
      return true;
    }
    return false;
  }
*/

  @Debounce(15)
  scroll(event) {
    this.verticalScrollPosition.next(this.getActualScrollRange(event.target.scrollHeight, event.target.clientHeight, event.target.scrollTop));
    this.horizontalScrollPosition.next(this.getActualScrollRange(event.target.scrollWidth, event.target.clientWidth, event.target.scrollLeft));
  }

  private getActualScrollRange(dimension: number, clientDimension: number, barStart: number): GridRange {
    const max = dimension - clientDimension;
    const barEnd: number = barStart + (dimension - max);
    return {begin: barStart, end: barEnd, min: 0, max: dimension}
  }

  private getItemScrollRange(gridRange: GridRange, standardDimension: number): GridRange {
    const scrollBarBegin: number = Math.floor(gridRange.begin / standardDimension);
    const scrollBarEnd: number = Math.ceil(gridRange.end / standardDimension) + this.preRender;
    const maxScroll: number = Math.floor(gridRange.max / standardDimension);
    return {...gridRange, begin: scrollBarBegin, end: scrollBarEnd, max: maxScroll};
  }

  private initRangeListener(scrollPositionSubject: Subject<GridRange>, endReachedEmitter: EventEmitter<boolean>, rangeSubject: Subject<GridRange>, standard: number): void {
    scrollPositionSubject.pipe(
      tap(range => rangeSubject.next(this.getItemScrollRange(range, standard))),
      tap(range => range.end === range.max && endReachedEmitter.emit(true))
    ).subscribe();
  }

/*  private getDefaultGridRange(direction?: 'horizontal' | 'vertical', knownGridRange?: GridRange): GridRange {
    if (this.infiniteGridContainer && direction && knownGridRange) {
      const max: number = direction === 'vertical' ? this.infiniteGridContainer.nativeElement.firstChild.offsetHeight : this.infiniteGridContainer.nativeElement.firstChild.offsetWidth;
      const end: number = direction === 'vertical' ? this.infiniteGridContainer.nativeElement.offsetHeight : this.infiniteGridContainer.nativeElement.offsetWidth;
      return {...knownGridRange, max, end};
    }
    return {min: 0, max: 0, begin: 0, end: 0};
  }*/
  private getDefaultGridRange(direction?: 'horizontal' | 'vertical', knownGridRange?: GridRange, element?: ElementRef): GridRange {
    if (element && direction && knownGridRange) {
      const max: number = direction === 'vertical' ? element.nativeElement.firstChild.offsetHeight : element.nativeElement.firstChild.offsetWidth;
      const end: number = direction === 'vertical' ? element.nativeElement.offsetHeight : element.nativeElement.offsetWidth;
      return {...knownGridRange, max, end:end};
    }
    return {min: 0, max: 0, begin: 0, end: 0};
  }
}
