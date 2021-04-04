import { ModuleWithProviders, NgModule } from '@angular/core';
import {EvaluatorComponent} from './evaluator.component';
import { CreateEvaluatorDialogComponent } from './create-evaluator-dialog/create-evaluator-dialog.component';
import {EvaluatorRoutingModule} from './evaluator-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule,
        EvaluatorRoutingModule,
    ],
    declarations: [
    EvaluatorComponent,
    CreateEvaluatorDialogComponent
    ],
    providers: [],
 })
export class EvaluatorModule {
}
