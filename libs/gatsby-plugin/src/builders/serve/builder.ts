import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { fork } from 'child_process';
import { join } from 'path';
import { Observable } from 'rxjs';
import { GatsbyPluginBuilderSchema } from './schema';

import { copySync } from 'fs-extra';

export function runBuilder(
  options: GatsbyPluginBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  return new Observable(subscriber => {
    const from = join(context.workspaceRoot, `dist/apps/${context.target.project}`);
    const to = join(context.workspaceRoot, `apps/${context.target.project}/public`);
    const cwd = join(context.workspaceRoot, `apps/${context.target.project}`);

    try {
      copySync(from, to);
    } catch (err) {
      console.error('Copy failed');
      subscriber.next({
        success: false
      });
    }

    const cp = fork(join(context.workspaceRoot, './node_modules/gatsby-cli/lib/index.js'), ['serve'], {
      cwd
    });

    cp.on('error', (err) => {
      console.log('ERROR: spawn failed! (' + err + ')');
    });

    cp.on('exit', (code) => {
      subscriber.next({
        success: code === 0
      });
    });
  });
}

export default createBuilder(runBuilder);
