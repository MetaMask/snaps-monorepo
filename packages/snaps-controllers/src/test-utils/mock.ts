import { assert } from '@metamask/utils';

/**
 * Get an existing function as mocked Jest function. This assumes that the
 * function is already mocked.
 *
 * This asserts that the function is mocked, and throws an error if it is not.
 *
 * @param fn - The function to get as a mocked function.
 * @returns The mocked function.
 * @example
 * The following code:
 * ```ts
 * const mock = jest.fn();
 * const fn = getMockedFunction(mock);
 * ```
 * Is equivalent to:
 * ```ts
 * const mock = jest.fn();
 * const fn = mock as jest.MockedFunction<typeof mock>;
 * ```
 */
export function getMockedFunction<Fn extends (...args: any[]) => unknown>(
  fn: Fn,
): jest.MockedFunction<Fn> {
  const mock = fn as jest.MockedFunction<Fn>;
  assert(mock.mock, 'Function is not mocked.');
  return mock;
}
