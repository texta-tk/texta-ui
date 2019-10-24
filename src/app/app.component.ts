import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import * as projectPackage from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public constructor(private titleService: Title) {
    this.setTitle(`TEXTA: ${projectPackage.version}`);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

}
