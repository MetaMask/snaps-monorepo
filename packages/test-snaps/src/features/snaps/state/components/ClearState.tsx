import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { Tag, useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { MANAGE_STATE_PORT, MANAGE_STATE_SNAP_ID } from '../constants';

export const ClearState: FunctionComponent<{ encrypted: boolean }> = ({
  encrypted,
}) => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleClick = () => {
    invokeSnap({
      snapId: getSnapId(MANAGE_STATE_SNAP_ID, MANAGE_STATE_PORT),
      method: 'clearState',
      params: { encrypted },
      tags: [encrypted ? Tag.TestState : Tag.UnencryptedTestState],
    }).catch(logError);
  };

  return (
    <>
      <Button
        id={encrypted ? 'clearState' : 'clearStateUnencrypted'}
        onClick={handleClick}
        disabled={isLoading}
        className="mb-3"
      >
        Clear State
      </Button>
      <Result className="mb-3">
        <span
          id={encrypted ? 'clearStateResult' : 'clearStateUnencryptedResult'}
        >
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
