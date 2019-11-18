import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReindexerComponent } from './reindexer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ReindexerComponent', () => {
  let component: ReindexerComponent;
  let fixture: ComponentFixture<ReindexerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReindexerComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReindexerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
