import { getPersistentState } from '@metamask/base-controller';
import type { SnapId } from '@metamask/snaps-sdk';
import {
  form,
  image,
  input,
  panel,
  text,
  ContentType,
} from '@metamask/snaps-sdk';
import {
  Box,
  Field,
  FileInput,
  Form,
  Image,
  Input,
  Link,
  Text,
} from '@metamask/snaps-sdk/jsx';
import {
  getJsonSizeUnsafe,
  getJsxElementFromComponent,
} from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  MockApprovalController,
  getRestrictedSnapInterfaceControllerMessenger,
  getRootSnapInterfaceControllerMessenger,
} from '../test-utils';
import { SnapInterfaceController } from './SnapInterfaceController';

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  getJsonSizeUnsafe: jest.fn().mockReturnValue(1),
}));

describe('SnapInterfaceController', () => {
  it('handles a notificationsListUpdated event on the controller messenger', async () => {
    const rootMessenger = getRootSnapInterfaceControllerMessenger();
    const controllerMessenger =
      getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

    const controller = new SnapInterfaceController({
      messenger: controllerMessenger,
      state: {
        interfaces: {
          // @ts-expect-error missing properties
          '1': {
            contentType: ContentType.Notification,
          },
          // @ts-expect-error missing properties
          '2': {
            contentType: ContentType.Dialog,
          },
        },
      },
    });

    rootMessenger.publish(
      'NotificationServicesController:notificationsListUpdated',
      [],
    );

    expect(controller.state).toStrictEqual({
      interfaces: {
        '2': {
          contentType: ContentType.Dialog,
        },
      },
    });

    controller.destroy();
  });

  describe('constructor', () => {
    it('persists notification interfaces', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
        state: {
          interfaces: {
            // @ts-expect-error missing properties
            '1': {
              contentType: ContentType.Notification,
            },
            // @ts-expect-error missing properties
            '2': {
              contentType: ContentType.Dialog,
            },
          },
        },
      });

      expect(
        getPersistentState(controller.state, controller.metadata),
      ).toStrictEqual({
        interfaces: {
          '1': {
            contentType: ContentType.Notification,
          },
        },
      });

      controller.destroy();
    });
  });

  describe('createInterface', () => {
    it('can create a new interface', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = panel([
        text('[foo](https://foo.bar)'),
        form({
          name: 'foo',
          children: [input({ name: 'bar' })],
        }),
      ]);

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      const { content, state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        2,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        3,
        'PhishingController:testOrigin',
        'https://foo.bar/',
      );

      expect(content).toStrictEqual(getJsxElementFromComponent(components));
      expect(state).toStrictEqual({ foo: { bar: null } });
      controller.destroy();
    });

    it('can create a new interface from JSX', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Box>
          <Text>
            <Link href="https://foo.bar">foo</Link>
          </Text>
          <Form name="foo">
            <Field label="Bar">
              <Input name="bar" type="text" />
            </Field>
          </Form>
        </Box>
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        element,
      );

      const { content, state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        2,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        3,
        'PhishingController:testOrigin',
        'https://foo.bar/',
      );

      expect(content).toStrictEqual(element);
      expect(state).toStrictEqual({ foo: { bar: null } });
      controller.destroy();
    });

    it('supports providing interface context', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Box>
          <Text>
            <Link href="https://foo.bar">foo</Link>
          </Text>
        </Box>
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        element,
        { foo: 'bar' },
      );

      const { content, context } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(element);
      expect(context).toStrictEqual({ foo: 'bar' });
      controller.destroy();
    });

    it('supports providing an interface content type', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Box>
          <Text>
            <Link href="https://foo.bar">foo</Link>
          </Text>
        </Box>
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        element,
        { foo: 'bar' },
        ContentType.Notification,
      );

      const { contentType } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(contentType).toStrictEqual(ContentType.Notification);
      controller.destroy();
    });

    it('throws if interface context is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      jest
        .mocked(getJsonSizeUnsafe)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(10_000_000);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Box>
          <Text>
            <Link href="https://foo.bar">foo</Link>
          </Text>
        </Box>
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          element,
          { foo: 'a'.repeat(1_000_000) },
        ),
      ).rejects.toThrow('A Snap interface context may not be larger than 1 MB');
      controller.destroy();
    });

    it('throws if a link is on the phishing list', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      rootMessenger.registerActionHandler(
        'PhishingController:maybeUpdateState',
        jest.fn(),
      );

      rootMessenger.registerActionHandler(
        'PhishingController:testOrigin',
        () => ({ result: true, type: 'all' }),
      );

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = panel([
        text('[foo](https://foo.bar)'),
        form({
          name: 'foo',
          children: [input({ name: 'bar' })],
        }),
      ]);

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          components,
        ),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        2,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        3,
        'PhishingController:testOrigin',
        'https://foo.bar/',
      );

      controller.destroy();
    });

    it('throws if a JSX link is on the phishing list', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      rootMessenger.registerActionHandler(
        'PhishingController:maybeUpdateState',
        jest.fn(),
      );

      rootMessenger.registerActionHandler(
        'PhishingController:testOrigin',
        () => ({ result: true, type: 'all' }),
      );

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Box>
          <Text>
            Foo <Link href="https://foo.bar">Bar</Link>
          </Text>
        </Box>
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          element,
        ),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        2,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        3,
        'PhishingController:testOrigin',
        'https://foo.bar/',
      );
      controller.destroy();
    });

    it('throws if UI content is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      jest.mocked(getJsonSizeUnsafe).mockReturnValueOnce(11_000_000);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = panel([image(`<svg />`)]);

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          components,
        ),
      ).rejects.toThrow('A Snap UI may not be larger than 10 MB.');
      controller.destroy();
    });

    it('throws if JSX UI content is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      jest.mocked(getJsonSizeUnsafe).mockReturnValueOnce(11_000_000);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Box>
          <Image src="<svg />" />
        </Box>
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          element,
        ),
      ).rejects.toThrow('A Snap UI may not be larger than 10 MB.');
      controller.destroy();
    });

    it('throws if text content is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = panel([text('[foo](https://foo.bar)'.repeat(2500))]);

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          components,
        ),
      ).rejects.toThrow('The text in a Snap UI may not be larger than 50 kB.');
      controller.destroy();
    });
  });

  describe('getInterface', () => {
    it('gets the interface', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      const { content } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(getJsxElementFromComponent(components));
      controller.destroy();
    });

    it('throws if the snap requesting the interface is not the one that created it', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      expect(() =>
        rootMessenger.call(
          'SnapInterfaceController:getInterface',
          'foo' as SnapId,
          id,
        ),
      ).toThrow(`Interface not created by foo.`);
      controller.destroy();
    });

    it('throws if the interface does not exist', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      expect(() =>
        rootMessenger.call(
          'SnapInterfaceController:getInterface',
          MOCK_SNAP_ID,
          'test',
        ),
      ).toThrow(`Interface with id 'test' not found.`);
      controller.destroy();
    });
  });

  describe('updateInterface', () => {
    it('can update an interface', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      await rootMessenger.call(
        'SnapInterfaceController:updateInterface',
        MOCK_SNAP_ID,
        id,
        newContent,
      );

      const { content, state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(getJsxElementFromComponent(newContent));
      expect(state).toStrictEqual({ foo: { baz: null } });
      controller.destroy();
    });

    it('can update an interface using JSX', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Form name="foo">
          <Field label="Bar">
            <Input name="bar" type="text" />
          </Field>
        </Form>
      );

      const newElement = (
        <Form name="foo">
          <Field label="Baz">
            <Input name="baz" type="text" />
          </Field>
        </Form>
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        element,
      );

      await rootMessenger.call(
        'SnapInterfaceController:updateInterface',
        MOCK_SNAP_ID,
        id,
        newElement,
      );

      const { content, state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(newElement);
      expect(state).toStrictEqual({ foo: { baz: null } });
      controller.destroy();
    });

    it('can update an interface and context', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const context = { foo: 'bar' };

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
        context,
      );

      const newContext = { foo: 'baz' };

      await rootMessenger.call(
        'SnapInterfaceController:updateInterface',
        MOCK_SNAP_ID,
        id,
        newContent,
        newContext,
      );

      const {
        content,
        state,
        context: interfaceContext,
      } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(getJsxElementFromComponent(newContent));
      expect(state).toStrictEqual({ foo: { baz: null } });
      expect(interfaceContext).toStrictEqual(newContext);
      controller.destroy();
    });

    it('does not replace context if none is provided', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const context = { foo: 'bar' };

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
        context,
      );

      await rootMessenger.call(
        'SnapInterfaceController:updateInterface',
        MOCK_SNAP_ID,
        id,
        newContent,
      );

      const {
        content,
        state,
        context: interfaceContext,
      } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(getJsxElementFromComponent(newContent));
      expect(state).toStrictEqual({ foo: { baz: null } });
      expect(interfaceContext).toStrictEqual(context);
      controller.destroy();
    });

    it('throws if a link is on the phishing list', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      rootMessenger.registerActionHandler(
        'PhishingController:maybeUpdateState',
        jest.fn(),
      );

      rootMessenger.registerActionHandler(
        'PhishingController:testOrigin',
        () => ({ result: true, type: 'all' }),
      );

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const newContent = panel([
        text('[foo](https://foo.bar)'),
        form({
          name: 'foo',
          children: [input({ name: 'baz' })],
        }),
      ]);

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          id,
          newContent,
        ),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        4,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        5,
        'PhishingController:testOrigin',
        'https://foo.bar/',
      );
      controller.destroy();
    });

    it('throws if a JSX link is on the phishing list', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      rootMessenger.registerActionHandler(
        'PhishingController:maybeUpdateState',
        jest.fn(),
      );

      rootMessenger.registerActionHandler(
        'PhishingController:testOrigin',
        () => ({ result: true, type: 'all' }),
      );

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Form name="foo">
          <Field label="Bar">
            <Input name="bar" type="text" />
          </Field>
        </Form>
      );

      const newElement = (
        <Box>
          <Text>
            Foo <Link href="https://foo.bar">Bar</Link>
          </Text>
          {element}
        </Box>
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        element,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          id,
          newElement,
        ),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        4,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        5,
        'PhishingController:testOrigin',
        'https://foo.bar/',
      );
      controller.destroy();
    });

    it('throws if UI content is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      jest
        .mocked(getJsonSizeUnsafe)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(11_000_000);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const newContent = panel([image('<svg />')]);

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          id,
          newContent,
        ),
      ).rejects.toThrow('A Snap UI may not be larger than 10 MB.');
      controller.destroy();
    });

    it('throws if JSX UI content is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      jest
        .mocked(getJsonSizeUnsafe)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(11_000_000);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const element = (
        <Form name="foo">
          <Field label="Bar">
            <Input name="bar" type="text" />
          </Field>
        </Form>
      );

      const newElement = (
        <Box>
          <Image src={'<svg />'} />
        </Box>
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        element,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          id,
          newElement,
        ),
      ).rejects.toThrow('A Snap UI may not be larger than 10 MB.');
      controller.destroy();
    });

    it('throws if text content is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const newContent = panel([text('[foo](https://foo.bar)'.repeat(2500))]);

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          id,
          newContent,
        ),
      ).rejects.toThrow('The text in a Snap UI may not be larger than 50 kB.');
      controller.destroy();
    });

    it('throws if the interface does not exist', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          'foo',
          content,
        ),
      ).rejects.toThrow("Interface with id 'foo' not found.");
      controller.destroy();
    });

    it('throws if the interface is updated by another snap', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        content,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          'foo' as SnapId,
          id,
          newContent,
        ),
      ).rejects.toThrow('Interface not created by foo.');
      controller.destroy();
    });
  });

  describe('updateInterfaceState', () => {
    it('updates the interface state', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newState = { foo: { bar: 'baz' } };

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        content,
      );

      rootMessenger.call(
        'SnapInterfaceController:updateInterfaceState',
        id,
        newState,
      );

      const { state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(state).toStrictEqual(newState);
      controller.destroy();
    });

    it('updates the interface state with a file', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = (
        <Form name="foo">
          <Field label="Bar">
            <FileInput name="bar" />
          </Field>
        </Form>
      );

      const newState = {
        foo: {
          bar: {
            name: 'test.png',
            size: 123,
            contentType: 'image/png',
            contents: 'foo',
          },
        },
      };

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        content,
      );

      rootMessenger.call(
        'SnapInterfaceController:updateInterfaceState',
        id,
        newState,
      );

      const { state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(state).toStrictEqual(newState);
      controller.destroy();
    });
  });

  describe('deleteInterface', () => {
    it('can delete an interface', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        content,
      );

      rootMessenger.call('SnapInterfaceController:deleteInterface', id);

      expect(() =>
        rootMessenger.call(
          'SnapInterfaceController:getInterface',
          MOCK_SNAP_ID,
          id,
        ),
      ).toThrow(`Interface with id '${id}' not found.`);
      controller.destroy();
    });
  });

  describe('resolveInterface', () => {
    it('resolves the interface with the given value', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const approvalControllerMock = new MockApprovalController();

      rootMessenger.registerActionHandler(
        'ApprovalController:hasRequest',
        approvalControllerMock.hasRequest.bind(approvalControllerMock),
      );

      rootMessenger.registerActionHandler(
        'ApprovalController:acceptRequest',
        approvalControllerMock.acceptRequest.bind(approvalControllerMock),
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        <Box>
          <Text>foo</Text>
        </Box>,
      );

      const approvalPromise = approvalControllerMock.addRequest({
        id,
      });

      rootMessenger.call(
        'SnapInterfaceController:resolveInterface',
        MOCK_SNAP_ID,
        id,
        'bar',
      );

      expect(await approvalPromise).toBe('bar');
      controller.destroy();
    });

    it('throws if the interface does not exist', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const approvalControllerMock = new MockApprovalController();

      rootMessenger.registerActionHandler(
        'ApprovalController:hasRequest',
        approvalControllerMock.hasRequest.bind(approvalControllerMock),
      );

      rootMessenger.registerActionHandler(
        'ApprovalController:acceptRequest',
        approvalControllerMock.acceptRequest.bind(approvalControllerMock),
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:resolveInterface',
          MOCK_SNAP_ID,
          'foo',
          'bar',
        ),
      ).rejects.toThrow(`Interface with id 'foo' not found.`);
      controller.destroy();
    });

    it('throws if the interface is resolved by another snap', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const approvalControllerMock = new MockApprovalController();

      rootMessenger.registerActionHandler(
        'ApprovalController:hasRequest',
        approvalControllerMock.hasRequest.bind(approvalControllerMock),
      );

      rootMessenger.registerActionHandler(
        'ApprovalController:acceptRequest',
        approvalControllerMock.acceptRequest.bind(approvalControllerMock),
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        <Box>
          <Text>foo</Text>
        </Box>,
      );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      approvalControllerMock.addRequest({
        id,
      });

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:resolveInterface',
          'baz' as SnapId,
          id,
          'bar',
        ),
      ).rejects.toThrow('Interface not created by baz.');
      controller.destroy();
    });

    it('throws if the interface has no approval request', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const controller = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const approvalControllerMock = new MockApprovalController();

      rootMessenger.registerActionHandler(
        'ApprovalController:hasRequest',
        approvalControllerMock.hasRequest.bind(approvalControllerMock),
      );

      rootMessenger.registerActionHandler(
        'ApprovalController:acceptRequest',
        approvalControllerMock.acceptRequest.bind(approvalControllerMock),
      );

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        <Box>
          <Text>foo</Text>
        </Box>,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:resolveInterface',
          MOCK_SNAP_ID,
          id,
          'bar',
        ),
      ).rejects.toThrow(`Approval request with id '${id}' not found.`);
      controller.destroy();
    });
  });
});
