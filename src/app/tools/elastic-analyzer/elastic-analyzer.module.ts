import { ModuleWithProviders, NgModule } from '@angular/core';
import {ElasticAnalyzerComponent} from './elastic-analyzer.component';
import { CreateElasticAnalyzerDialogComponent } from './create-elastic-analyzer-dialog/create-elastic-analyzer-dialog.component';
import {ElasticAnalyzerRoutingModule} from './elastic-analyzer-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';

@NgModule({
    imports: [
        SharedModule,
        ElasticAnalyzerRoutingModule,
    ],
    declarations: [
    ElasticAnalyzerComponent,
    CreateElasticAnalyzerDialogComponent
    ],
    providers: [],
 })
export class ElasticAnalyzerModule {
}
