import {Component, ElementRef, HostListener, Inject, OnInit, TemplateRef} from '@angular/core';
import {INFO_PORTAL_DATA} from '../InfoPortalData';
import {OverlayRef} from '@angular/cdk/overlay';

@Component({
  selector: 'app-info-icon-portal',
  templateUrl: './info-icon-portal.component.html',
  styleUrls: ['./info-icon-portal.component.scss']
})
export class InfoIconPortalComponent implements OnInit {

  // tslint:disable-next-line:no-any
  constructor(@Inject(INFO_PORTAL_DATA) public componentData: { template: TemplateRef<any>, overlayRef: OverlayRef, title: string }) {
  }

  ngOnInit(): void {
  }

  closePortal(): void {
    this.componentData.overlayRef.detach();
    this.componentData.overlayRef.dispose();
  }

}
