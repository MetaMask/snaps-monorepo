import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { DialogType } from '@metamask/snaps-sdk';
import { Bold, Panel, Text } from '@metamask/snaps-sdk/jsx';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'showAlert':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: (
            <Panel>
              <Text>
                Hello from <Bold>JSX</Bold>.
              </Text>
            </Panel>
          ),
        },
      });

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};
