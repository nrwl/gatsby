import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  externalSchematic,
  Tree,
  noop,
  url
} from '@angular-devkit/schematics';

import {
  addProjectToNxJsonInTree,
  formatFiles,
  names,
  projectRootDir,
  ProjectType,
  toFileName,
  updateWorkspaceInTree
} from '@nrwl/workspace';

import init from '../init/init';
import { GatsbyPluginSchematicSchema } from './schema';

const projectType = ProjectType.Application;

interface NormalizedSchema extends GatsbyPluginSchematicSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  options: GatsbyPluginSchematicSchema
): NormalizedSchema {
  const name = toFileName(options.name);
  const projectDirectory = options.directory
    ? `${toFileName(options.directory)}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${projectRootDir(projectType)}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map(s => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags
  };
}

function createApplicationFiles(options: NormalizedSchema): Rule {
  return mergeWith(
    apply(url(`./files`), [
      applyTemplates({
        ...options,
        ...names(options.name)
      }),
      move(options.projectRoot)
    ])
  );
}

export default function(options: GatsbyPluginSchematicSchema): Rule {
  const normalizedOptions = normalizeOptions(options);
  return chain([
    init({
      ...options,
      skipFormat: true
    }),
    addProject(normalizedOptions),
    addProjectToNxJsonInTree(normalizedOptions.projectName, {
      tags: normalizedOptions.parsedTags
    }),
    createApplicationFiles(normalizedOptions),
    addJest(normalizedOptions),
    addCypress(normalizedOptions),
    addPrettierIgnoreEntry(normalizedOptions),
    addGitIgnoreEntry(normalizedOptions),
    formatFiles()
  ]);
}

function addProject(options: NormalizedSchema): Rule {
  return updateWorkspaceInTree(json => {
    const architect: { [key: string]: any } = {};

    architect.build = {
      builder: '@nrwl/gatsby:build'
    };

    architect.serve = {
      builder: '@nrwl/gatsby:develop'
    };

    json.projects[options.projectName] = {
      root: options.projectRoot,
      sourceRoot: `${options.projectRoot}/src`,
      projectType,
      schematics: {},
      architect
    };

    json.defaultProject = json.defaultProject || options.projectName;

    return json;
  });
}

function addCypress(options: NormalizedSchema): Rule {
  return options.e2eTestRunner === 'cypress'
    ? externalSchematic('@nrwl/cypress', 'cypress-project', {
      ...options,
      name: options.name + '-e2e',
      directory: options.directory,
      project: options.projectName
    })
    : noop();
}

function addJest(options: NormalizedSchema): Rule {
  return options.unitTestRunner === 'jest'
    ? externalSchematic('@nrwl/jest', 'jest-project', {
      project: options.projectName,
      supportTsx: true,
      skipSerializers: true,
      setupFile: 'none',
      babelJest: false
    })
    : noop();
}

function addPrettierIgnoreEntry(options: NormalizedSchema) {
  return (tree: Tree, context: SchematicContext) => {
    let prettierIgnoreFile = tree.read('.prettierignore')?.toString('utf-8');
    if (prettierIgnoreFile) {
      prettierIgnoreFile = prettierIgnoreFile + `\n/apps/${options.projectName}/node_modules\n/apps/${options.projectName}/public\n/apps/${options.projectName}/.cache\n`;
      tree.overwrite('.prettierignore', prettierIgnoreFile);
    } else {
      context.logger.warn(`Couldn't find .prettierignore file to update`);
    }
  };
}

function addGitIgnoreEntry(options: NormalizedSchema) {
  return (tree: Tree, context: SchematicContext) => {
    let gitIgnoreFile = tree.read('.gitignore')?.toString('utf-8');
    if (gitIgnoreFile) {
      gitIgnoreFile = gitIgnoreFile + `\n/apps/${options.projectName}/node_modules\n/apps/${options.projectName}/public\n/apps/${options.projectName}/.cache\n`;
      tree.overwrite('.gitignore', gitIgnoreFile);
    } else {
      context.logger.warn(`Couldn't find .gitignore file to update`);
    }
  };
}
