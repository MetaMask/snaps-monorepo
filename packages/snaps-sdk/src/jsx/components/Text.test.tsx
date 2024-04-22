import { Bold } from '@metamask/snaps-sdk/jsx';

import { Text } from './Text';

describe('Text', () => {
  it('renders text', () => {
    const result = <Text>Foo</Text>;

    expect(result).toStrictEqual({
      type: 'text',
      key: null,
      props: {
        children: 'Foo',
      },
    });
  });

  it('renders text with nested text', () => {
    const result = <Text>Hello {'world'}!</Text>;

    expect(result).toStrictEqual({
      type: 'text',
      key: null,
      props: {
        children: ['Hello ', 'world', '!'],
      },
    });
  });

  it('renders text with formatting elements', () => {
    const result = (
      <Text>
        Hello <Bold>world</Bold>!
      </Text>
    );

    expect(result).toStrictEqual({
      type: 'text',
      key: null,
      props: {
        children: [
          'Hello ',
          {
            type: 'bold',
            key: null,
            props: {
              children: 'world',
            },
          },
          '!',
        ],
      },
    });
  });
});
