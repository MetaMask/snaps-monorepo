import ora from 'ora';

import { getMockConfig } from '../test-utils';
import { getDefaultConfiguration } from './config';

jest.dontMock('fs');
jest.mock('module', () => ({
  // Built-in modules are different across Node versions, so we need to mock
  // them out.
  builtinModules: ['fs', 'path'],
}));

describe('getDefaultConfiguration', () => {
  it.each([
    getMockConfig('webpack', {
      input: 'src/index.js',
      output: {
        path: '/foo/bar',
      },
      manifest: {
        path: '/foo/snap.manifest.json',
      },
    }),
    getMockConfig('webpack', {
      input: 'src/index.ts',
      output: {
        path: '/bar/baz',
      },
      manifest: {
        path: '/bar/snap.manifest.json',
      },
    }),
    getMockConfig('webpack', {
      input: 'src/index.ts',
      output: {
        path: '/bar/baz',
      },
      manifest: {
        path: '/bar/snap.manifest.json',
      },
      plugins: {
        bundleWarnings: false,
      },
      sourceMap: 'inline',
    }),
    getMockConfig('webpack', {
      input: 'src/index.ts',
      output: {
        path: '/bar/baz',
      },
      manifest: {
        path: '/bar/snap.manifest.json',
      },
      environment: {
        FOO: 'bar',
      },
      plugins: {
        bundleWarnings: false,
        builtInResolver: false,
      },
      sourceMap: true,
    }),
  ])(
    'returns the default Webpack configuration for the given CLI config',
    (config) => {
      jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(getDefaultConfiguration(config)).toMatchSnapshot();
    },
  );

  it.each([
    {
      evaluate: true,
      watch: true,
    },
    {
      evaluate: false,
      watch: false,
    },
    {
      evaluate: true,
      watch: false,
    },
    {
      evaluate: false,
      watch: true,
    },
    {
      evaluate: true,
      watch: true,
      spinner: ora(),
    },
  ])(
    'returns the default Webpack configuration for the given CLI config and options',
    (options) => {
      jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

      const config = getMockConfig('webpack', {
        input: 'src/index.ts',
        output: {
          path: '/bar/baz',
        },
        manifest: {
          path: '/bar/snap.manifest.json',
        },
      });

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(getDefaultConfiguration(config, options)).toMatchSnapshot();
    },
  );
});
