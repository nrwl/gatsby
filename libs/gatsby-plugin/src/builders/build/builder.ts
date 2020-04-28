import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { fork } from 'child_process';
import { join } from 'path';
import { Observable } from 'rxjs';
import { GatsbyPluginBuilderSchema } from './schema';

export function runBuilder(
  options: GatsbyPluginBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  return new Observable(subscriber => {
    if (options.serve) {
      runGatsbyBuild(context.workspaceRoot, context.target.project)
        .then(() => runGatsbyServe(context.workspaceRoot, context.target.project))
        .then(() => {
          subscriber.next({
            success: true
          });
        })
        .catch((err) => {
          context.logger.error('Error during build & serve', err);
        });
    } else {
      runGatsbyBuild(context.workspaceRoot, context.target.project)
        .then(() => {
          subscriber.next({
            success: true
          });
        })
        .catch((err) => {
          context.logger.error('Error during runGatsbyDevelop', err);
          subscriber.next({
            success: false
          });
        });
    }
  });
}

function runGatsbyBuild(workspaceRoot, project) {
  return new Promise((resolve, reject) => {
    const cp = fork(join(workspaceRoot, './node_modules/gatsby-cli/lib/index.js'), ['build'], {
      cwd: join(workspaceRoot, `apps/${project}`)
    });

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

function runGatsbyServe(workspaceRoot, project) {
  return new Promise((resolve, reject) => {
    const cwd = join(workspaceRoot, `apps/${project}`);

    const cp = fork(join(workspaceRoot, './node_modules/gatsby-cli/lib/index.js'),
      ['serve'],
      { cwd }
    );

    cp.on('error', (err) => {
      reject(err);
    });

    cp.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}

export default createBuilder(runBuilder);
