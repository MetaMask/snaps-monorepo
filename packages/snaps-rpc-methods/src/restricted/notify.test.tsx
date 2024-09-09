import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { NotificationType } from '@metamask/snaps-sdk';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

import {
  getImplementation,
  getValidatedParams,
  specificationBuilder,
} from './notify';

describe('snap_notify', () => {
  const validParams = {
    type: NotificationType.InApp,
    message: 'Some message',
  };

  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        showNativeNotification: jest.fn(),
        showInAppNotification: jest.fn(),
        isOnPhishingList: jest.fn(),
        maybeUpdatePhishingList: jest.fn(),
      };

      expect(
        specificationBuilder({
          methodHooks,
        }),
      ).toStrictEqual({
        allowedCaveats: null,
        methodImplementation: expect.anything(),
        permissionType: PermissionType.RestrictedMethod,
        targetName: 'snap_notify',
        subjectTypes: [SubjectType.Snap],
      });
    });
  });

  describe('getImplementation', () => {
    it('shows inApp notification', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      await notificationImplementation({
        context: {
          origin: 'extension',
        },
        method: 'snap_notify',
        params: {
          type: NotificationType.InApp,
          message: 'Some message',
        },
      });

      expect(showInAppNotification).toHaveBeenCalledWith('extension', {
        type: NotificationType.InApp,
        message: 'Some message',
      });
    });

    it('shows native notification', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      await notificationImplementation({
        context: {
          origin: 'extension',
        },
        method: 'snap_notify',
        params: {
          type: NotificationType.Native,
          message: 'Some message',
        },
      });

      expect(showNativeNotification).toHaveBeenCalledWith('extension', {
        type: NotificationType.Native,
        message: 'Some message',
      });
    });

    it('accepts string notification types', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      await notificationImplementation({
        context: {
          origin: 'extension',
        },
        method: 'snap_notify',
        params: {
          type: 'native',
          message: 'Some message',
        },
      });

      expect(showNativeNotification).toHaveBeenCalledWith('extension', {
        type: NotificationType.Native,
        message: 'Some message',
      });
    });

    it('throws an error if the notification type is invalid', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            // @ts-expect-error - Invalid type for testing purposes.
            type: 'invalid-type',
            message: 'Some message',
          },
        }),
      ).rejects.toThrow('Must specify a valid notification "type".');
    });
  });

  describe('getValidatedParams', () => {
    it('throws an error if the params is not an object', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() => getValidatedParams([], isOnPhishingList)).toThrow(
        'Expected params to be a single object.',
      );
    });

    it('throws an error if the type is missing from params object', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          { type: undefined, message: 'Something happened.' },
          isOnPhishingList,
        ),
      ).toThrow('Must specify a valid notification "type".');
    });

    it('throws an error if the message is empty', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          { type: NotificationType.InApp, message: '' },
          isOnPhishingList,
        ),
      ).toThrow(
        'Must specify a non-empty string "message" less than 500 characters long.',
      );
    });

    it('throws an error if the message is not a string', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          { type: NotificationType.InApp, message: 123 },
          isOnPhishingList,
        ),
      ).toThrow(
        'Must specify a non-empty string "message" less than 500 characters long.',
      );
    });

    it('throws an error if the message is larger than or equal to 50 characters for native notifications', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          {
            type: NotificationType.Native,
            message:
              'test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg',
          },
          isOnPhishingList,
        ),
      ).toThrow(
        'Must specify a non-empty string "message" less than 50 characters long.',
      );
    });

    it('throws an error if the message is larger than or equal to 500 characters for in app notifications', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          {
            type: NotificationType.InApp,
            message:
              'test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg',
          },
          isOnPhishingList,
        ),
      ).toThrow(
        'Must specify a non-empty string "message" less than 500 characters long.',
      );
    });

    it('throws an error if a link in the `message` property is on the phishing list', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: '[test link](https://foo.bar)',
          },
        }),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');
    });

    it('throws an error if a link in the `message` property is invalid', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: '[test](http://foo.bar)',
          },
        }),
      ).rejects.toThrow(
        'Invalid URL: Protocol must be one of: https:, mailto:.',
      );
    });

    it('throws an error if a link in the `footerLink` property is on the phishing list', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      const content = (
        <Box>
          <Text>Hello, world!</Text>
        </Box>
      );

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: 'message',
            footerLink: '[test](https://foo.bar)',
            title: 'A title',
            detailedView: content,
          },
        }),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');
    });

    it('throws an error if a link in the `footerLink` property is invalid', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      const content = (
        <Box>
          <Text>Hello, world!</Text>
        </Box>
      );

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: 'message',
            footerLink: '[test](http://foo.bar)',
            title: 'A title',
            detailedView: content,
          },
        }),
      ).rejects.toThrow(
        'Invalid URL: Protocol must be one of: https:, mailto:.',
      );
    });

    it('throws an error if a link in the `title` property is on the phishing list', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      const content = (
        <Box>
          <Text>Hello, world!</Text>
        </Box>
      );

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: 'message',
            footerLink: 'a link',
            title: '[test](https://foo.bar)',
            detailedView: content,
          },
        }),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');
    });

    it('throws an error if a link in the `title` property is invalid', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
        isOnPhishingList,
        maybeUpdatePhishingList,
      });

      const content = (
        <Box>
          <Text>Hello, world!</Text>
        </Box>
      );

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: 'message',
            footerLink: 'a link',
            title: '[test](http://foo.bar)',
            detailedView: content,
          },
        }),
      ).rejects.toThrow(
        'Invalid URL: Protocol must be one of: https:, mailto:.',
      );
    });

    it('returns valid parameters', () => {
      const isNotOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      expect(
        getValidatedParams(validParams, isNotOnPhishingList),
      ).toStrictEqual(validParams);
    });
  });
});