import { SemVerVersion } from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_SHASUM,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import fetchMock from 'jest-fetch-mock';

import { JsonSnapRegistry } from './json';
import { SnapRegistryStatus } from './registry';

const MOCK_DATABASE = {
  verifiedSnaps: {
    [MOCK_SNAP_ID]: {
      id: MOCK_SNAP_ID,
      versions: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '1.0.0': {
          checksum: DEFAULT_SNAP_SHASUM,
          status: SnapRegistryStatus.Verified,
        },
      },
    },
  },
  blockedSnaps: [
    {
      shasum: 'foo',
      reason: { explanation: 'malicious' },
    },
    {
      id: 'npm:@consensys/starknet-snap',
      versionRange: '<0.1.11',
      reason: { explanation: 'vuln' },
    },
  ],
};

describe('JsonSnapRegistry', () => {
  fetchMock.enableMocks();
  it('can get entries from the registry', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        shasum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Verified,
      },
    });
  });

  it('returns unverified for non existing snaps', async () => {
    // Empty database
    fetchMock.mockResponse(JSON.stringify({}));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        shasum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Unverified,
      },
    });
  });

  it('returns unverified for non existing versions', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.1' as SemVerVersion,
        shasum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Unverified,
      },
    });
  });

  it('returns unverified if existing snap doesnt match checksum', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        shasum: 'bar',
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Unverified,
      },
    });
  });

  it('returns blocked if snap shasum is on blocklist', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        shasum: 'foo',
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Blocked,
        reason: { explanation: 'malicious' },
      },
    });
  });

  it('returns blocked if snap version range is on blocklist', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'npm:@consensys/starknet-snap': {
        version: '0.1.10' as SemVerVersion,
        shasum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'npm:@consensys/starknet-snap': {
        status: SnapRegistryStatus.Blocked,
        reason: { explanation: 'vuln' },
      },
    });
  });
});
