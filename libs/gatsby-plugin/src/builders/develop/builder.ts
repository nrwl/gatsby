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
  const baseUrl = `${options.https ? 'https' : 'http'}://${options.host}:${
    options.port
  }`;
  return new Observable((subscriber) => {
    runGatsbyDevelop(
      context.workspaceRoot,
      context.target.project,
      createGatsbyOptions(options)
    )
      .then((success) => {
        subscriber.next({
          baseUrl,
          success,
        });
      })
      .catch((err) => {
        context.logger.error('Error during develop', err?.message);
        console.log(err);
        subscriber.next({
          success: false,
        });
        subscriber.complete();
      });
  });
}

function createGatsbyOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (k === 'port' || k === 'host' || k === 'https' || k === 'open')
      acc.push(`--${k}=${options[k]}`);
    return acc;
  }, []);
}

async function runGatsbyDevelop(workspaceRoot, project, options) {
  return new Promise<boolean>((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, './node_modules/gatsby-cli/lib/index.js'),
      ['develop', ...options],
      {
        cwd: join(workspaceRoot, `apps/${project}`),
        env: {
          ...process.env,
        },
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      }
    );

    // Ensure the child process is killed when the parent exits
    process.on('exit', () => cp.kill());

    cp.on('message', ({ action }) => {
      if (
        action?.type === 'ACTIVITY_END' &&
        action?.payload?.status === 'SUCCESS' &&
        action?.payload?.id === 'webpack-develop'
      ) {
        resolve(true);
      }
    });

    cp.on('error', (err) => {
      reject(err);
    });

    cp.on('exit', (code) => {
      if (code !== 0) {
        reject(code);
      }
    });
  });
}

export default createBuilder(runBuilder);
