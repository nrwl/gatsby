import {
  checkFilesExist,
  ensureNxProject,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('gatsby-plugin e2e', () => {
  test('generates a valid gatsby application', async () => {
    const app = uniq('app');
    ensureNxProject('@nrwl/gatsby', 'dist/libs/gatsby-plugin');
    await runNxCommandAsync(`generate @nrwl/gatsby:app ${app}`);

    let result = await runNxCommandAsync(`build ${app}`);
    expect(result.stdout).toContain('Done building in');

    result = await runNxCommandAsync(`test ${app}`);
    expect(result.stderr).toContain('Test Suites: 1 passed, 1 total');

    // result = await runNxCommandAsync(`e2e ${app}-e2e`);
    // expect(result.stdout).toContain('All specs passed');
  }, 120000);

  test('supports --js option', async () => {
    const app = uniq('app');
    ensureNxProject('@nrwl/gatsby', 'dist/libs/gatsby-plugin');
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
