import {
  apply, applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext, SchematicsException,
  Tree,
  url
} from '@angular-devkit/schematics';


import {getWorkspace} from '@schematics/angular/utility/config';
import {parseName} from '@schematics/angular/utility/parse-name';
import {experimental, normalize, strings} from '@angular-devkit/core';

export function setupOptions(host: Tree, options: any): Tree {
  const workspace = getWorkspace(host);
  const projectName = options.project as string;
  if (!options.project) {
    options.project = workspace.projects[projectName];
  }
  const projectType = options.project.projectType === 'application' ? 'app' : 'lib';
  if (options.path === undefined) {
    options.path = `${options.project.sourceRoot}/${projectType}/models`;
  }

  const parsedPath = parseName(options.path, options.name);
  options.name = parsedPath.name;
  options.path = parsedPath.path;
  return host;
}
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function generateTask(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspaceConfig = tree.read('/angular.json');
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

    if (options.path === undefined) {
      options.path = `${__dirname}`;
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

export function generateTaskServices(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspaceConfig = tree.read('/angular.json');
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

    if (options.path === undefined) {
      options.path = `${options.sourceDir}`;
    }

    const templateSource = apply(url('./services'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        camelize: strings.camelize,
        name: options.name
      }),
      move('/src/app/core/' + strings.dasherize(options.name))
    ]);

    return mergeWith(templateSource);
  };
}

export function generateTaskTypes(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspaceConfig = tree.read('/angular.json');
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

    if (options.path === undefined) {
      options.path = `${options.sourceDir}`;
    }

    const templateSource = apply(url('./types'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        camelize: strings.camelize,
        name: options.name
      }),
      move('/src/app/shared/types/tasks/')
    ]);

    return mergeWith(templateSource);
  };
}
