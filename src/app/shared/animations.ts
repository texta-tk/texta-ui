import {animate, style, transition, trigger} from '@angular/animations';

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