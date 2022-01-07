import {Component, InjectionToken, Injector, Input, NgZone, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {FlexibleConnectedPositionStrategy, Overlay, OverlayContainer, OverlayRef, ViewportRuler} from '@angular/cdk/overlay';
import {Platform} from '@angular/cdk/platform';
import {MatButton} from '@angular/material/button';
import {ComponentPortal} from '@angular/cdk/portal';
import {InfoIconPortalComponent} from './info-icon-portal/info-icon-portal.component';
import {INFO_PORTAL_DATA} from './InfoPortalData';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';


@Component({
  selector: 'app-info-icon',
  templateUrl: './info-icon.component.html',
  styleUrls: ['./info-icon.component.scss']
})
export class InfoIconComponent implements OnInit, OnDestroy {

  overlayRef: OverlayRef | undefined;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  @Input() textTemplate: TemplateRef<any>;
  @Input() textTitle = '';

  constructor(private overlay: Overlay, private injector: Injector, private ngZone: NgZone,
              private platform: Platform, private overLayContainer: OverlayContainer,
  ) {
  }

  ngOnInit(): void {
  }

  openPopupPortal(element: MatButton): void {
    if (this.textTemplate && element && this.platform) {
      const positionStrategy = new FlexibleConnectedPositionStrategy(element._elementRef,
        new ViewportRuler(this.platform, this.ngZone, document), document, this.platform, this.overLayContainer);
      positionStrategy.withPositions([{
        originX: 'end',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
      }]);
      this.overlayRef = this.overlay.create({
        positionStrategy
      });

      this.overlayRef?.outsidePointerEvents().pipe(takeUntil(this.destroyed$)).subscribe(val => {
        if (this.overlayRef) {
          this.overlayRef.detach();
          this.overlayRef.dispose();
        }
      });

      const injectorToken = Injector.create({
        parent: this.injector,
        providers: [
          {provide: INFO_PORTAL_DATA, useValue: {template: this.textTemplate, overlayRef: this.overlayRef, title: this.textTitle}}
        ]
      });
      const infoPortal = new ComponentPortal(InfoIconPortalComponent, null, injectorToken);
      this.overlayRef.attach(infoPortal);
    }
  }

  ngOnDestroy(): void {

    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();

  }
}
