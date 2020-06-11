import {
  checkFilesExist,
  ensureNxProject,
  runNxCommandAsync,
  uniq,
  updateFile,
} from '@nrwl/nx-plugin/testing';

describe('gatsby-plugin e2e', () => {
  test('generates a valid gatsby application', async () => {
    const app = uniq('app');
    ensureNxProject('@nrwl/gatsby', 'dist/packages/gatsby-plugin');
    await runNxCommandAsync(`generate @nrwl/gatsby:app ${app}`);
    await runNxCommandAsync(
      `generate @nrwl/gatsby:component header --project ${app}`
    );

    checkFilesExist(
      `apps/${app}/package.json`,
      `apps/${app}/src/components/header.tsx`,
      `apps/${app}/src/components/header.spec.tsx`,
      `apps/${app}/src/pages/index.tsx`,
      `apps/${app}/src/pages/index.spec.tsx`
    );

    updateFile(`apps/${app}/src/pages/index.tsx`, (content) => {
      let updated = `import Header from '../components/header';\n${content}`;
      updated = updated.replace('<main>', '<Header /><main>');
      return updated;
    });

    let result = await runNxCommandAsync(`build ${app}`);
    expect(result.stdout).toContain('Done building in');

    result = await runNxCommandAsync(`test ${app}`);
    expect(result.stderr).toContain('Test Suites: 2 passed, 2 total');

    // result = await runNxCommandAsync(`e2e ${app}-e2e`);
    // expect(result.stdout).toContain('All specs passed');
  }, 120000);

  test('supports --js option', async () => {
    const app = uniq('app');
    ensureNxProject('@nrwl/gatsby', 'dist/packages/gatsby-plugin');
    await runNxCommandAsync(`generate @nrwl/gatsby:app ${app} --js`);

    checkFilesExist(
      `apps/${app}/package.json`,
      `apps/${app}/src/pages/index.js`,
      `apps/${app}/src/pages/index.spec.js`
    );

    const result = await runNxCommandAsync(`build ${app}`);
    expect(result.stdout).toContain('Done building in');
  }, 120000);
});
