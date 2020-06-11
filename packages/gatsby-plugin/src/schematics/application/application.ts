import { join, normalize } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  addLintFiles,
  addProjectToNxJsonInTree,
  formatFiles,
  generateProjectLint,
  Linter,
  names,
  projectRootDir,
  ProjectType,
  toFileName,
  updateWorkspaceInTree,
} from '@nrwl/workspace';

import init from '../init/init';
import { GatsbyPluginSchematicSchema } from './schema';
import { appsDir } from '@nrwl/workspace/src/utils/ast-utils';
import { updateJestConfigContent } from '@nrwl/react/src/utils/jest-utils';
import { toJS } from '@nrwl/workspace/src/utils/rules/to-js';
import {
  assertValidStyle,
  extraEslintDependencies,
  reactEslintJson,
} from '@nrwl/react';
import { addStyleDependencies } from '../../utils/styles';

const projectType = ProjectType.Application;

interface NormalizedSchema extends GatsbyPluginSchematicSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  styledModule: null | string;
}

export default function (options: GatsbyPluginSchematicSchema): Rule {
  const normalizedOptions = normalizeOptions(options);
  return chain([
    init({
      ...options,
      skipFormat: true,
    }),
    addLintFiles(normalizedOptions.projectRoot, Linter.EsLint, {
      localConfig: {
        ...reactEslintJson,
        rules: {
          ...reactEslintJson.rules,
          '@typescript-eslint/camelcase': 'off',
        },
        ignorePatterns: ['!**/*', 'public'],
      },
      extraPackageDeps: extraEslintDependencies,
    }),
    addProject(normalizedOptions),
    addProjectToNxJsonInTree(normalizedOptions.projectName, {
      tags: normalizedOptions.parsedTags,
    }),
    createApplicationFiles(normalizedOptions),
    addStyleDependencies(options.style),
    addJest(normalizedOptions),
    updateJestConfig(normalizedOptions),
    addCypress(normalizedOptions),
    addPrettierIgnoreEntry(normalizedOptions),
    addGitIgnoreEntry(normalizedOptions),
    formatFiles(),
  ]);
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
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const styledModule = /^(css|scss|less|styl)$/.test(options.style)
    ? null
    : options.style;

  assertValidStyle(options.style);

  return {
    ...options,
    styledModule,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function createApplicationFiles(options: NormalizedSchema): Rule {
  return mergeWith(
    apply(url(`./files`), [
      applyTemplates({
        ...options,
        ...names(options.name),
      }),
      options.styledModule
        ? filter((file) => !file.endsWith(`.${options.style}`))
        : noop(),
      move(options.projectRoot),
      options.js ? toJS() : noop(),
    ])
  );
}

function addProject(options: NormalizedSchema): Rule {
  return updateWorkspaceInTree((json) => {
    const architect: { [key: string]: any } = {};

    architect.build = {
      builder: '@nrwl/gatsby:build',
      options: {
        uglify: true,
        color: true,
        profile: false,
      },
      configurations: {
        production: {},
      },
    };

    architect.serve = {
      builder: '@nrwl/gatsby:server',
      options: {
        buildTarget: `${options.projectName}:build`,
      },
      configurations: {
        production: {
          buildTarget: `${options.projectName}:build:production`,
        },
      },
    };

    architect.lint = generateProjectLint(
      normalize(options.projectRoot),
      join(normalize(options.projectRoot), 'tsconfig.json'),
      Linter.EsLint
    );

    json.projects[options.projectName] = {
      root: options.projectRoot,
      sourceRoot: `${options.projectRoot}/src`,
      projectType,
      schematics: {},
      architect,
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
        project: options.projectName,
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
        babelJest: false,
      })
    : noop();
}

function addPrettierIgnoreEntry(options: NormalizedSchema) {
  return (tree: Tree, context: SchematicContext) => {
    let prettierIgnoreFile = tree.read('.prettierignore')?.toString('utf-8');
    if (prettierIgnoreFile) {
      prettierIgnoreFile =
        prettierIgnoreFile +
        `\n/apps/${options.projectName}/node_modules\n/apps/${options.projectName}/public\n/apps/${options.projectName}/.cache\n`;
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
      gitIgnoreFile =
        gitIgnoreFile +
        `\n/apps/${options.projectName}/node_modules\n/apps/${options.projectName}/public\n/apps/${options.projectName}/.cache\n`;
      tree.overwrite('.gitignore', gitIgnoreFile);
    } else {
      context.logger.warn(`Couldn't find .gitignore file to update`);
    }
  };
}

function updateJestConfig(options: NormalizedSchema) {
  return options.unitTestRunner === 'none'
    ? noop()
    : (host) => {
        const appDirectory = options.directory
          ? `${toFileName(options.directory)}/${toFileName(options.name)}`
          : toFileName(options.name);
        const appProjectRoot = `${appsDir(host)}/${appDirectory}`;
        const configPath = `${appProjectRoot}/jest.config.js`;
        const originalContent = host.read(configPath).toString();
        const content = updateJestConfigContent(originalContent);
        host.overwrite(configPath, content);
      };
}
