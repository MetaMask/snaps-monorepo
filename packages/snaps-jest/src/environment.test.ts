import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import { resolve } from 'path';

import { SnapsEnvironment } from './environment';
import { DEFAULT_GLOBAL_CONFIG, DEFAULT_PROJECT_CONFIG } from './test-utils';

const ENVIRONMENT_CONFIG: JestEnvironmentConfig = {
  globalConfig: DEFAULT_GLOBAL_CONFIG,
  projectConfig: {
    ...DEFAULT_PROJECT_CONFIG,
    testEnvironmentOptions: {
      server: {
        root: resolve(__dirname, './test-utils/snap'),
      },
    },
  },
};

const ENVIRONMENT_CONTEXT: EnvironmentContext = {
  console,
  docblockPragmas: {},
  testPath: __filename,
};

describe('SnapsEnvironment', () => {
  it('starts a server if enabled', async () => {
    const environment = new SnapsEnvironment(
      ENVIRONMENT_CONFIG,
      ENVIRONMENT_CONTEXT,
    );

    await environment.setup();
    expect(environment.snapId).toMatch(/^local:http:\/\/localhost:\d+$/u);

    await environment.teardown();
  });

  it('throws when trying to access the snap ID when the server is disabled', async () => {
    const environment = new SnapsEnvironment(
      {
        ...ENVIRONMENT_CONFIG,
        projectConfig: {
          ...ENVIRONMENT_CONFIG.projectConfig,
          testEnvironmentOptions: {
            server: {
              enabled: false,
            },
          },
        },
      },
      ENVIRONMENT_CONTEXT,
    );

    await environment.setup();
    expect(() => environment.snapId).toThrow(
      'You must specify a snap ID, because the built-in server is not running.',
    );

    await environment.teardown();
  });

  describe('installSnap', () => {
    it('installs a Snap and keeps track of it, terminating any previously installed Snaps', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const environment = new SnapsEnvironment(
        ENVIRONMENT_CONFIG,
        ENVIRONMENT_CONTEXT,
      );

      await environment.setup();

      const instance = await environment.installSnap();
      expect(instance?.executionService).toBeDefined();
      expect(consoleSpy).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(
          /\[Snap: local:http:\/\/localhost:\d+\] Hello, world!/u,
        ),
      );

      const terminateSpy = jest.spyOn(
        instance?.executionService,
        'terminateAllSnaps',
      );

      const secondInstance = await environment.installSnap();
      expect(terminateSpy).toHaveBeenCalledTimes(1);
      expect(secondInstance?.executionService).toBeDefined();
      expect(secondInstance?.executionService).not.toBe(
        instance?.executionService,
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        4,
        expect.stringMatching(
          /\[Snap: local:http:\/\/localhost:\d+\] Hello, world!/u,
        ),
      );

      await environment.teardown();
    });
  });
});
