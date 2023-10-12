import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import {
  LIFECYCLE_HOOKS_SNAP_ID,
  LIFECYCLE_HOOKS_SNAP_PORT,
  LIFECYCLE_HOOKS_VERSION,
} from './constants';

export const LifecycleHooks: FunctionComponent = () => {
  // TODO: Right now there isn't any published version of this Snap, so we can't
  // test the update functionality. Once there is, we should add a button to
  // trigger the update.
  return (
    <Snap
      name="Lifecycle Hooks Snap"
      snapId={LIFECYCLE_HOOKS_SNAP_ID}
      port={LIFECYCLE_HOOKS_SNAP_PORT}
      version={LIFECYCLE_HOOKS_VERSION}
      testId="lifecycle-hooks"
    />
  );
};
