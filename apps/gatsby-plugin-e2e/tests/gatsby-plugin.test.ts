import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq
} from '@nrwl/nx-plugin/testing';

describe('gatsby-plugin e2e', () => {
  it('should create gatsby application and build it', async done => {
    // gatsby build runs more that default 5000ms
    // so we need to adjust the timeout
    jest.setTimeout(300000);

    const plugin = uniq('testapp');
    ensureNxProject(
      '@nrwl/gatsby',
      'dist/libs/gatsby-plugin'
    );
    await runNxCommandAsync(
      `generate @nrwl/gatsby:app ${plugin}`
    );

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Done building in');

    done();
  });
});
