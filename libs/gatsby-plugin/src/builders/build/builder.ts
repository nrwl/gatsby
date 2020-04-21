import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { fork } from 'child_process';
import { join } from 'path';
import { Observable } from 'rxjs';
import { GatsbyPluginBuilderSchema } from './schema';

import { move } from 'fs-extra';

export function runBuilder(
  options: GatsbyPluginBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  return new Observable(subscriber => {
    const cp = fork(join(context.workspaceRoot, './node_modules/gatsby-cli/lib/index.js'), ['build'], {
      cwd: join(context.workspaceRoot, `apps/${context.target.project}`)
    });

    cp.on('error', (err) => {
      console.log('ERROR: spawn failed! (' + err + ')');
    });

    cp.on('exit', (code) => {
      if (code === 0) {
        const from = join(context.workspaceRoot, `apps/${context.target.project}/public`);
        const to = join(context.workspaceRoot, `dist/apps/${context.target.project}`);

        move(from, to, err => {
          if (err) {
            subscriber.next({
              success: false
            });
          }

          subscriber.next({
            success: true
          });
        });
      } else {
        subscriber.next({
          success: code === 0
        });
      }
    });
  });
}

export default createBuilder(runBuilder);
