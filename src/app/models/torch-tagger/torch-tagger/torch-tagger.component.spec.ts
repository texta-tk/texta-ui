import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TorchTaggerComponent } from './torch-tagger.component';
import { SharedModule } from 'src/app/shared/shared-module/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TorchTaggerComponent', () => {
  let component: TorchTaggerComponent;
  let fixture: ComponentFixture<TorchTaggerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ TorchTaggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorchTaggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
