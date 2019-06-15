import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { Course } from "../model/course";
import { CoursesService } from "../services/courses.service";
import { debounceTime, distinctUntilChanged, startWith, tap, timeout } from 'rxjs/operators';
import { merge } from "rxjs/observable/merge";
import { fromEvent } from 'rxjs/observable/fromEvent';
import { Lesson } from '../model/lesson';
import { LessonsDataSource} from '../services/lessons.datasource';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

    course: Course;

    // dataSource = new MatTableDataSource([]);
    dataSource:LessonsDataSource;
    displayedColumns = ['seqNo', 'description', 'duration'];
    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    @ViewChild(MatSort)
    sort: MatSort;

    @ViewChild('input')
    input: ElementRef;

    constructor(private route: ActivatedRoute,
        private coursesService: CoursesService) {

    }

    ngOnInit() {

        this.course = this.route.snapshot.data["course"];
        // this.coursesService.findAllCourseLessons(this.course.id)
        //     .subscribe(lessons => this.dataSource.data=lessons);

        this.dataSource = new LessonsDataSource(this.coursesService);
        
        this.dataSource.loadLessons(this.course.id, '', 'asc', 0, 3);

    }

    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0)

        fromEvent(this.input.nativeElement, 'keyup')
            .pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;
                    this.loadLessonsPage();
                })
            ).subscribe();

        merge(this.sort.sortChange,
            this.paginator.page)
            .pipe(
                tap(() => {
                    this.loadLessonsPage();
                })
            )
            .subscribe();
    }

    loadLessonsPage() {
        this.dataSource.
        loadLessons(this.course.id,
             this.input.nativeElement.value, 
             this.sort.direction,
             this.paginator.pageIndex, 
             this.paginator.pageSize);
    }
    // searchLessons(search =''){
    //     this.dataSource.filter = search.toLowerCase().trim();
    // }

}
