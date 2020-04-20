import {animate, animateChild, animation, group, query, style, transition, trigger} from '@angular/animations';

export const expandRowAnimation = trigger('detailExpand', [
  transition(
    ':enter',
    [
      style({height: '0px', minHeight: '0'}),
      animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        style({height: '*'}))
    ]
  ),
  transition(
    ':leave',
    [
      style({height: '*'}),
      animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        style({height: '0px', minHeight: '0'}))
    ]
  ),
]);
/*export const clusterSlideInAnimation =
  trigger('routeAnimation', [
    transition('clusters <=> cluster', [
      style({ position: 'relative'}),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '-100%'})
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '100%'}))
        ]),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%'}))
        ])
      ]),
      query(':enter', animateChild()),
    ])
  ]);*/
