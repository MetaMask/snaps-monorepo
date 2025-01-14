import type {
  OnCronjobHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import { panel, text, heading, MethodNotFoundError } from '@metamask/snaps-sdk';

import type {
  CancelNotificationParams,
  ScheduleNotificationParamsWithDate,
  ScheduleNotificationParamsWithDuration,
} from './types';

/**
 * Handle cronjob execution requests from MetaMask. This handler handles two
 * methods:
 *
 * - `execute`: The JSON-RPC method that is called by MetaMask when the cronjob
 * is triggered. This method is specified in the snap manifest under the
 * `endowment:cronjob` permission. If you want to support more methods (e.g.,
 * with different times), you can add them to the manifest there.
 * - `fireNotification`: The JSON-RPC method that is called by MetaMask when the
 * background event is triggered. This method call is scheduled by the `scheduleNotification`
 * method in the `onRpcRequest` handler.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#oncronjob
 */
export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'execute':
      // Cronjobs can execute any method that is available to the snap.
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([
            heading('Cronjob'),
            text('This dialog was triggered by a cronjob.'),
          ]),
        },
      });
    case 'fireNotification':
      return snap.request({
        method: 'snap_notify',
        params: {
          type: 'inApp',
          message: 'Hello world!',
        },
      });
    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError({ method: request.method });
  }
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles four methods:
 *
 * - `scheduleNotificationWithDate`: Schedule a notification in the future with the `date` param.
 * - `scheduleNotificationWithDuration`: Schedule a notification in the future with the `duration` param.
 * - `cancelNotification`: Cancel a notification.
 * - `getBackgroundEvents`: Get the Snap's background events.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'scheduleNotificationWithDate':
      return snap.request({
        method: 'snap_scheduleBackgroundEvent',
        params: {
          date: (request.params as ScheduleNotificationParamsWithDate).date,
          request: {
            method: 'fireNotification',
          },
        },
      });
    case 'scheduleNotificationWithDuration':
      return snap.request({
        method: 'snap_scheduleBackgroundEvent',
        params: {
          duration: (request.params as ScheduleNotificationParamsWithDuration)
            .duration,
          request: {
            method: 'fireNotification',
          },
        },
      });
    case 'cancelNotification':
      return snap.request({
        method: 'snap_cancelBackgroundEvent',
        params: {
          id: (request.params as CancelNotificationParams).id,
        },
      });
    case 'getBackgroundEvents':
      return snap.request({
        method: 'snap_getBackgroundEvents',
      });
    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError({ method: request.method });
  }
};
