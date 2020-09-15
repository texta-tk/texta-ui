import {
  apply, applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
  SchematicsException
} from '@angular-devkit/schematics';

import {normalize, strings, experimental} from '@angular-devkit/core';
import {Schema} from './schema';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function generateTextaModelModule(options: Schema): Rule {
  // tslint:disable-next-line:variable-name
  return (_tree: Tree) => {
    const workspaceConfig = _tree.read('/angular.json');
    if (!workspaceConfig) {
      throw new SchematicsException('Could not find Angular workspace configuration');
    }

    // convert workspace to string
    const workspaceContent = workspaceConfig.toString();

    // parse workspace string into JSON object
    const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(workspaceContent);
    if (!options.project) {
      options.project = workspace.defaultProject;
    }

    const projectName = options.project as string;

    const project = workspace.projects[projectName];

    const projectType = project.projectType === 'application' ? 'app' : 'lib';

    if (options.path === undefined) {
      options.path = `./${project.sourceRoot}/${projectType}`;
    }

    const templateSource = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        camelize: strings.camelize,
        name: options.name
      }),
      move((options.flat) ?
        normalize(options.path) :
        normalize(options.path + '/' + strings.dasherize(options.name)))
    ]);

    return chain([
      generateTaskServices(options),
      generateTaskTypes(options),
      mergeWith(templateSource)
    ]);
  };
}

export function generateTaskServices(options: Schema): Rule {
  // tslint:disable-next-line:variable-name
  return (_tree: Tree, _context: SchematicContext) => {

    const templateSource = apply(url('./services'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        camelize: strings.camelize,
        name: options.name
      }),
      move('./src/app/core/models/' + strings.dasherize(options.name))
    ]);

    return mergeWith(templateSource);
  };
}

export function generateTaskTypes(options: Schema): Rule {
  // tslint:disable-next-line:variable-name
  return (_tree: Tree, _context: SchematicContext) => {

    const templateSource = apply(url('./types'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        camelize: strings.camelize,
        name: options.name
      }),
      move('./src/app/shared/types/tasks/')
    ]);

    return mergeWith(templateSource);
  };
}
