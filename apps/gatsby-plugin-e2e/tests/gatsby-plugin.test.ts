import {
  ensureNxProject,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('gatsby-plugin e2e', () => {
  const plugin = uniq('testapp');

  // gatsby build runs more that default 5000ms
  // so we need to adjust the timeout
  jest.setTimeout(300000);

  test('generates a valid gatsby application', async () => {
    ensureNxProject('@nrwl/gatsby', 'dist/libs/gatsby-plugin');
    await runNxCommandAsync(`generate @nrwl/gatsby:app ${plugin}`);

    let result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Done building in');

    result = await runNxCommandAsync(`e2e ${plugin}-e2e`);
    expect(result.stdout).toContain('All specs passed');
  });
});
