import { ModuleWithProviders, NgModule } from '@angular/core';
import {ElasticAnalyzerComponent} from './elastic-analyzer.component';
import { CreateElasticAnalyzerDialogComponent } from './create-elastic-analyzer-dialog/create-elastic-analyzer-dialog.component';
import {ElasticAnalyzerRoutingModule} from './elastic-analyzer-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';
import { ApplyStemmerTextDialogComponent } from './apply-stemmer-text-dialog/apply-stemmer-text-dialog.component';

@NgModule({
    imports: [
        SharedModule,
        ElasticAnalyzerRoutingModule,
    ],
    declarations: [
    ElasticAnalyzerComponent,
    CreateElasticAnalyzerDialogComponent,
    ApplyStemmerTextDialogComponent
    ],
    providers: [],
 })
export class ElasticAnalyzerModule {
}
