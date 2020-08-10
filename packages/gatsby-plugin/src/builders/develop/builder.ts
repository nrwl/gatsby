import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { fork } from 'child_process';
import { join } from 'path';
import { Observable } from 'rxjs';
import { GatsbyPluginBuilderSchema } from './schema';

export function runBuilder(
  options: GatsbyPluginBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  return new Observable<BuilderOutput>((subscriber) => {
    runGatsbyBuild(context.workspaceRoot, context.target.project, options)
      .then(() => {
        subscriber.next({
          success: true,
        });
        subscriber.complete();
      })
      .catch((err) => {
        context.logger.error('Error during develop', err);
        subscriber.next({
          success: false,
        });
        subscriber.complete();
      });
  });
}

export function runGatsbyBuild(
  workspaceRoot: string,
  project: string,
  options: GatsbyPluginBuilderSchema
) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, './node_modules/gatsby-cli/lib/index.js'),
      ['develop', ...createGatsbyBuildOptions(options)],
      {
        cwd: join(workspaceRoot, `apps/${project}`),
      }
    );

    cp.on('error', (err) => {
      reject(err);
    });

    cp.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

function createGatsbyBuildOptions(options: GatsbyPluginBuilderSchema) {
  return Object.keys(options).reduce((acc, k) => {
    const val = options[k];
    if (typeof val === 'undefined') return acc;
    switch (k) {
      case 'prefixPaths':
        return val ? acc.concat(`--prefix-paths`) : acc;
      case 'uglify':
        return val ? acc : acc.concat('--no-uglify');
      case 'color':
        return val ? acc : acc.concat('--no-color');
      case 'profile':
        return val ? acc.concat('--profile') : acc;
      case 'openTracingConfigFile':
        return val ? acc.concat([`--open-tracing-config-file`, val]) : acc;
      case 'graphqlTracing':
        return val ? acc.concat('--graphql-tracing') : acc;
      case 'serve':
      case 'host':
      case 'port':
      default:
        return acc;
    }
  }, []);
}

export default createBuilder(runBuilder);
