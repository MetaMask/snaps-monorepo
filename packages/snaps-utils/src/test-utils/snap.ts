import {
  getSnapChecksum,
  PersistedSnap,
  Snap,
  SnapStatus,
  TruncatedSnap,
} from '../snaps';
import { SemVerVersion } from '../versions';
import { VirtualFile } from '../virtual-file/VirtualFile';
import { MakeSemVer } from './common';
import {
  DEFAULT_ICON_PATH,
  DEFAULT_SOURCE_PATH,
  getSnapManifest,
} from './manifest';

/**
 * A mock snap source and its shasum.
 */
export const DEFAULT_SNAP_BUNDLE = `
  module.exports.onRpcRequest = ({ request }) => {
    console.log("Hello, world!");

    const { method, id } = request;
    return method + id;
  };
`;

export const DEFAULT_SNAP_ICON = '<svg />';

export const DEFAULT_SNAP_CHECKSUM = getSnapChecksum([
  new VirtualFile({ value: DEFAULT_SNAP_BUNDLE, path: DEFAULT_SOURCE_PATH }),
  new VirtualFile({ value: DEFAULT_SNAP_ICON, path: DEFAULT_ICON_PATH }),
]);

export const MOCK_SNAP_ID = 'npm:@metamask/example-snap';
export const MOCK_LOCAL_SNAP_ID = 'local:http://localhost:8080';
export const MOCK_ORIGIN = 'example.com';

type GetPersistedSnapObjectOptions = Partial<MakeSemVer<PersistedSnap>>;
type GetSnapObjectOptions = Partial<MakeSemVer<Snap>>;
type GetTruncatedSnapOptions = Partial<MakeSemVer<TruncatedSnap>>;

export const getPersistedSnapObject = ({
  blocked = false,
  enabled = true,
  id = MOCK_SNAP_ID,
  manifest = getSnapManifest(),
  permissionName = `wallet_snap_${id}`,
  sourceCode = DEFAULT_SNAP_BUNDLE,
  status = SnapStatus.Stopped,
  version = getSnapManifest().version,
  versionHistory = [
    { origin: MOCK_ORIGIN, version: '1.0.0', date: expect.any(Number) },
  ],
}: GetPersistedSnapObjectOptions = {}): PersistedSnap => {
  return {
    blocked,
    id,
    permissionName,
    version: version as SemVerVersion,
    manifest,
    status,
    enabled,
    sourceCode,
    versionHistory,
  } as const;
};

export const getSnapObject = ({
  blocked = false,
  enabled = true,
  id = MOCK_SNAP_ID,
  manifest = getSnapManifest(),
  permissionName = `wallet_snap_${id}`,
  status = SnapStatus.Stopped,
  version = getSnapManifest().version,
  versionHistory = [
    { origin: MOCK_ORIGIN, version: '1.0.0', date: expect.any(Number) },
  ],
}: GetSnapObjectOptions = {}): Snap => {
  return {
    blocked,
    id,
    permissionName,
    version: version as SemVerVersion,
    manifest,
    status,
    enabled,
    versionHistory,
  } as const;
};

export const getTruncatedSnap = ({
  id = MOCK_SNAP_ID,
  permissionName = `wallet_snap_${id}`,
  manifest = getSnapManifest(),
  version = getSnapManifest().version,
  enabled = true,
  blocked = false,
}: GetTruncatedSnapOptions = {}): TruncatedSnap => {
  return {
    id,
    permissionName,
    version: version as SemVerVersion,
    manifest,
    enabled,
    blocked,
  } as const;
};

/**
 * Gets a whole suite of associated snap data, including the snap's id, origin,
 * package name, source code, shasum, manifest, and SnapController state object.
 *
 * @param options - Options bag.
 * @param options.id - The id of the snap.
 * @param options.origin - The origin associated with the snap's installation
 * request.
 * @param options.sourceCode - The snap's source code. Will be used to compute
 * the snap's shasum.
 * @param options.blocked - Whether the snap's state object should indicate that
 * the snap is blocked.
 * @param options.enabled - Whether the snap's state object should indicate that
 * the snap is enabled. Must not be `true` if the snap is blocked.
 * @returns The mock snap data.
 */
export const getMockSnapData = ({
  blocked = false,
  enabled = true,
  id,
  origin,
  sourceCode,
}: {
  id: string;
  origin: string;
  sourceCode?: string;
  blocked?: boolean;
  enabled?: boolean;
}) => {
  if (blocked && enabled) {
    throw new Error('A snap may not be enabled if it is blocked.');
  }

  const packageName = `${id}-package`;
  const manifest = getSnapManifest();

  return {
    id,
    origin,
    packageName,
    shasum: DEFAULT_SNAP_CHECKSUM,
    sourceCode,
    manifest,
    stateObject: getPersistedSnapObject({
      blocked,
      enabled,
      id,
      manifest,
      sourceCode,
    }),
  };
};
