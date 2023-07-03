import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';

// Note: The `instantiate` function is generated by AssemblyScript. It does not
// seem to work, however, so we only use it for type checking.
// eslint-disable-next-line import/order
import type { instantiate } from '../build/program';

// This is the WASM module, generated by AssemblyScript, inlined as a
// `Uint8Array` by the MetaMask Snaps CLI loader.
// eslint-disable-next-line import/extensions
import program from '../build/program.wasm';

/**
 * The type of the WASM module. This is generated by AssemblyScript.
 */
type Program = Awaited<ReturnType<typeof instantiate>>;

/**
 * The type of the WASM module's methods. This is generated by AssemblyScript.
 */
type Method = Exclude<keyof Program, 'memory'>;

let wasm: Program;

/**
 * Instantiate the WASM module and store the exports in `wasm`. This function
 * is called lazily, when the first JSON-RPC request is received.
 *
 * We use Webpack's `asset/inline` loader to inline the WASM module as a hex
 * string. This string is then converted to a byte array and passed to
 * `WebAssembly.instantiate` to instantiate the module.
 *
 * For this example, we're using AssemblyScript to generate the WASM module, but
 * you can use any language that can compile to WASM.
 *
 * @returns A promise that resolves when the WASM module is instantiated.
 * @throws If the WASM module fails to instantiate.
 */
const initializeWasm = async () => {
  try {
    const { instance } = await WebAssembly.instantiate(program, {});

    wasm = instance.exports as Program;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to instantiate WebAssembly module.', error);
    throw error;
  }
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `fibonacci`: Calculate the nth Fibonacci number. This method takes a
 * single parameter, `n` (as array), which is the index of the Fibonacci number
 * to calculate. This uses the WASM module to calculate the Fibonacci number.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentwebassembly
 * @see https://developer.mozilla.org/docs/WebAssembly
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  // Instantiate the WASM module if it hasn't been instantiated yet.
  if (!wasm) {
    await initializeWasm();
  }

  // For this example, we don't validate the request. We assume that the
  // request is valid, and that the snap is only called with valid requests. In
  // a real snap, you should validate the request before calling the WASM
  // module.
  const method = request.method as Method;
  const params = request.params as Parameters<Program[typeof method]>;

  if (wasm[method]) {
    return wasm[method](...params);
  }

  throw rpcErrors.methodNotFound({ data: { request } });
};
