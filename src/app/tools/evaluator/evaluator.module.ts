import { ModuleWithProviders, NgModule } from '@angular/core';
import {EvaluatorComponent} from './evaluator.component';
import { CreateEvaluatorDialogComponent } from './create-evaluator-dialog/create-evaluator-dialog.component';
import {EvaluatorRoutingModule} from './evaluator-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';
import { IndividualResultsDialogComponent } from './individual-results-dialog/individual-results-dialog.component';
import { FilteredAverageDialogComponent } from './filtered-average-dialog/filtered-average-dialog.component';
import { EditEvaluatorDialogComponent } from './edit-evaluator-dialog/edit-evaluator-dialog.component';
import { MisclassifiedExamplesDialogComponent } from './misclassified-examples-dialog/misclassified-examples-dialog.component';

@NgModule({
    imports: [
        SharedModule,
        EvaluatorRoutingModule,
    ],
    declarations: [
    EvaluatorComponent,
    CreateEvaluatorDialogComponent,
    IndividualResultsDialogComponent,
    FilteredAverageDialogComponent,
    EditEvaluatorDialogComponent,
    MisclassifiedExamplesDialogComponent
    ],
    providers: [],
 })
export class EvaluatorModule {
}
