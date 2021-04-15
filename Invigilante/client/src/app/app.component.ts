import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Invigilante';

  public constructor(
    private titleService: Title,
  ) {
  }

  ngOnInit(): void {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('mat-app-background');
    body.style.backgroundImage = 'url(../assets/background.png)';
    // body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundPosition = 'center';
    body.style.backgroundSize = 'cover';
    this.titleService.setTitle(this.title);
  }
}
