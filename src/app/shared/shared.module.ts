import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatListModule} from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, MatTooltipModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';

import {LoginDialogComponent} from './components/dialogs/login/login-dialog.component';
import {GenericTableComponent} from './components/generic-table/generic-table.component';
import {RegistrationDialogComponent} from './components/dialogs/registration/registration-dialog.component';
import {TimelineComponent} from './components/svg/timeline/timeline.component';
import {ScatterComponent} from './components/svg/scatter/scatter.component';
import {HistogramComponent} from './components/svg/histogram/histogram.component';
import {ChartComponent} from './components/svg/chart/chart.component';
import {AxisComponent} from './components/svg/chart/axis/axis.component';
import {GradientComponent} from './components/svg/chart/gradient/gradient.component';
import {BarsComponent} from './components/svg/chart/bars/bars.component';
import {CirclesComponent} from './components/svg/chart/circles/circles.component';
import {LineComponent} from './components/svg/chart/line/line.component';
import {ConfirmDialogComponent} from './components/dialogs/confirm-dialog/confirm-dialog.component';
import {MatOptionSelectAllComponent} from "./components/mat-option-select-all.component";

@NgModule({
  declarations: [LoginDialogComponent, GenericTableComponent,
    RegistrationDialogComponent,

    TimelineComponent,
    ScatterComponent,
    HistogramComponent,
    ChartComponent,
    AxisComponent,
    LineComponent,
    CirclesComponent,
    BarsComponent,
    GradientComponent,
    ConfirmDialogComponent,
    MatOptionSelectAllComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,

  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    ScrollingModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,

    GenericTableComponent,

    TimelineComponent,
    ScatterComponent,
    HistogramComponent,
    ChartComponent,
    AxisComponent,
    LineComponent,
    CirclesComponent,
    BarsComponent,
    GradientComponent,
    MatOptionSelectAllComponent
  ],
  entryComponents: [LoginDialogComponent, RegistrationDialogComponent, ConfirmDialogComponent],
})
export class SharedModule {
}
