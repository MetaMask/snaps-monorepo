import { Box } from '@chakra-ui/react';
import type { JSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Renderer } from '../Renderer';

export type FormProps = {
  id: string;
  node: unknown;
};

export const Form: FunctionComponent<FormProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Form', 'Expected value to be a form component.');

  return (
    <Box key={`${id}-form`} as="form">
      {getJsxChildren(node).map((child, index) => (
        <Renderer
          key={`${id}-form-child-${index}`}
          id={`${id}-form-child-${index}`}
          node={child as JSXElement}
        />
      ))}
    </Box>
  );
};
