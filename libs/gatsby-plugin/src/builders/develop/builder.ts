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
    const cp = fork(join(context.workspaceRoot, './node_modules/gatsby-cli/lib/index.js'), ['develop'], {
      cwd: join(context.workspaceRoot, `apps/${context.target.project}`)
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
