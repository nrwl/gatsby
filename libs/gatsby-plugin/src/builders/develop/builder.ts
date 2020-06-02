import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { fork } from 'child_process';
import { join } from 'path';
import { Observable } from 'rxjs';
import { GatsbyPluginBuilderSchema } from './schema';

export function runBuilder(
  options: GatsbyPluginBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  const gatsbyOptions = normalizeGatsbyOptions(options);
  return new Observable(subscriber => {
    runGatsbyDevelop(
      context.workspaceRoot,
      context.target.project,
      gatsbyOptions
    )
      .then(() => {
        subscriber.next({
          success: true
        });
      })
      .catch(err => {
        context.logger.error('Error during runGatsbyDevelop', err);
        subscriber.next({
          success: false
        });
      });
  });
}

function normalizeGatsbyOptions(options) {
  const gatsbyDevelopOptions = {
    host: '--host',
    port: '--port',
    open: '--open',
    https: '--https',
    H: '--host',
    p: '--port',
    o: '--open',
    S: '--https'
  };
  const gatsbyOptions = [];

  Object.keys(options).forEach(key => {
    if (gatsbyDevelopOptions.hasOwnProperty(key)) {
      gatsbyOptions.push(`${gatsbyDevelopOptions[key]}=${options[key]}`);
    }
  });

  return gatsbyOptions;
}

function runGatsbyDevelop(workspaceRoot, project, options) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, './node_modules/gatsby-cli/lib/index.js'),
      ['develop', ...options],
      { cwd: join(workspaceRoot, `apps/${project}`) }
    );

    cp.on('error', err => {
      reject(err);
    });

    cp.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

export default createBuilder(runBuilder);
