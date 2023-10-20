import { AssertionError, assert, assertStruct } from '@metamask/utils';
import { is } from 'superstruct';

import type { Component } from './nodes';
import { ComponentStruct, NodeType } from './nodes';

/**
 * Check if the given value is a {@link Component}. This performs recursive
 * validation of the component's children (if any).
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link Component}, `false` otherwise.
 */
export function isComponent(value: unknown): value is Component {
  return is(value, ComponentStruct);
}

/**
 * Assert that the given value is a {@link Component}. This performs recursive
 * validation of the component's children (if any).
 *
 * @param value - The value to check.
 * @throws If the value is not a {@link Component}.
 */
export function assertIsComponent(value: unknown): asserts value is Component {
  assertStruct(value, ComponentStruct, 'Invalid component');
}

const LINK_REGEX = /(?<protocol>[a-z]+:\/?\/?)(?<host>\S+?(?:\.[a-z]+)+)/giu;

enum AlloweProtocols {
  Https = 'https:',
  Mailto = 'mailto:',
}

const ALLOWED_PROTOCOLS = Object.values(AlloweProtocols);

/**
 * Searches for links in a sting and checks them against the phishing list.
 *
 * @param text - The text to verify.
 * @param isOnPhishingList - The function that checks the link against the phishing list.
 */
export function assertLinksAreSafe(
  text: string,
  isOnPhishingList: (url: string) => boolean,
) {
  const links = text.match(LINK_REGEX);
  if (links) {
    links.forEach((link) => {
      try {
        const url = new URL(link);
        assert(
          ALLOWED_PROTOCOLS.includes(url.protocol as AlloweProtocols),
          `protocol must be one of: ${ALLOWED_PROTOCOLS.join(', ')}`,
        );

        const hostname =
          url.protocol === AlloweProtocols.Mailto
            ? url.pathname.split('@')[1]
            : url.hostname;

        assert(!isOnPhishingList(hostname), 'detected as phishing');
      } catch (error) {
        throw new Error(
          `Invalid URL: ${
            error instanceof AssertionError ? error.message : 'invalid sintax'
          }.`,
        );
      }
    });
  }
}

/**
 * Searches for links in UI components and checks that the URL they are trying to
 * pass in not in the phishing list.
 *
 * @param component - The custom UI component.
 * @param isOnPhishingList - The function that checks the link against the phishing list.
 */
export function assertUILinksAreSafe(
  component: Component,
  isOnPhishingList: (url: string) => boolean,
) {
  const { type } = component;
  if (type === NodeType.Panel) {
    component.children.forEach((node) =>
      assertUILinksAreSafe(node, isOnPhishingList),
    );
  }

  if (component.type === NodeType.Text) {
    assertLinksAreSafe(component.value, isOnPhishingList);
  }
}
