import { DataSource, CollectionViewer } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of } from "rxjs";
import { Lesson } from "../model/lesson";
import { CoursesService } from "./courses.service";
import { catchError, finalize } from "rxjs/operators";

export class LessonsDataSource implements DataSource<Lesson> {
    private lessonSubject = new BehaviorSubject<Lesson[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$: Observable<boolean> = this.loadingSubject.asObservable();

    constructor(private courseService: CoursesService) {

    }

    loadLessons(courseId: number,
        filter: string,
        sortOrder: string,
        pageIndex: number,
        pageSize: number) {
        this.loadingSubject.next(true);
        this.courseService.findLessons(courseId,
            filter,
            sortOrder,
            pageIndex,
            pageSize)
            .pipe( // below code ensure that when there is error returned by server any empty array is emitted
                catchError(()=> of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(lessons => this.lessonSubject.next(lessons));
    }

    connect(collectionViewer: CollectionViewer): Observable<Lesson[]> {
        return this.lessonSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.lessonSubject.complete();
        this.loadingSubject.complete();
    }
}