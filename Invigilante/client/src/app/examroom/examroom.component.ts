import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../service/api.service';

@Component({
  selector: 'app-examroom',
  templateUrl: './examroom.component.html',
  styleUrls: ['./examroom.component.css']
})
export class ExamroomComponent implements OnInit {

  validCourseName = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const courseName = params.get('course');
      this.apiService.getCourseNames().subscribe((courses) => {
        // console.log(courseName, courses);
        if (!courses.includes(courseName)) {
          this.router.navigate(['/dashboard']);
        } else {
          this.validCourseName = true;
        }
      });
    });
  }

  ngOnInit(): void {
  }

}
