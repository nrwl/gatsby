import { ensureNxProject, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing';

describe('gatsby-plugin e2e', () => {
  const plugin = uniq('testapp');

  // gatsby build runs more that default 5000ms
  // so we need to adjust the timeout
  jest.setTimeout(300000);

  beforeAll(async (done) => {
    ensureNxProject(
      '@nrwl/gatsby',
      'dist/libs/gatsby-plugin'
    );
    await runNxCommandAsync(
      `generate @nrwl/gatsby:app ${plugin}`
    );
    done();
  });

  it('should build gatsby application', async done => {
    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Done building in');
    done();
  });
});
