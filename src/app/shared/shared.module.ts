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
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
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
import {MatSliderModule} from '@angular/material/slider';
import {FlexLayoutModule} from '@angular/flex-layout';

import {LoginDialogComponent} from './components/dialogs/login/login-dialog.component';
import {GenericTableComponent} from './components/generic-table/generic-table.component';
import {RegistrationDialogComponent} from './components/dialogs/registration/registration-dialog.component';
import {ConfirmDialogComponent} from './components/dialogs/confirm-dialog/confirm-dialog.component';
import {MatOptionSelectAllComponent} from './components/mat-option-select-all.component';
import {QueryDialogComponent} from './components/dialogs/query-dialog/query-dialog.component';
import {GenericDialogComponent} from './components/dialogs/generic-dialog/generic-dialog.component';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {SavedSearchAutocompleteComponent} from './components/saved-search-autocomplete/saved-search-autocomplete.component';
import {LineChartModule} from '@swimlane/ngx-charts';
import {MatTreeModule} from '@angular/material/tree';
import {MaterialFileInputModule} from 'ngx-material-file-input';

@NgModule({
  declarations: [LoginDialogComponent, GenericTableComponent,
    RegistrationDialogComponent,
    ConfirmDialogComponent,
    MatOptionSelectAllComponent,
    QueryDialogComponent,
    GenericDialogComponent,
    SavedSearchAutocompleteComponent
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
    MatSliderModule,
    MatTreeModule,
    LineChartModule,
    InfiniteScrollModule,
    MaterialFileInputModule,
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
    MatSliderModule,
    MatTreeModule,
    GenericTableComponent,
    SavedSearchAutocompleteComponent,

    MatOptionSelectAllComponent,

    LineChartModule,
    InfiniteScrollModule,
    MaterialFileInputModule,
  ],
  entryComponents: [
    LoginDialogComponent,
    RegistrationDialogComponent,
    ConfirmDialogComponent,
    QueryDialogComponent,
    GenericDialogComponent
  ]
})
export class SharedModule {
}
