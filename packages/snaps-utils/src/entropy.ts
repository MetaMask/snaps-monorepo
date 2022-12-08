import { HardenedBIP32Node, SLIP10Node } from '@metamask/key-tree';
import {
  add0x,
  assert,
  concatBytes,
  createDataView,
  Hex,
  stringToBytes,
} from '@metamask/utils';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';

const HARDENED_VALUE = 0x80000000;

// 0xd36e6170 - 0x80000000
export const SIP_6_MAGIC_VALUE = `1399742832'` as `${number}'`;

/**
 * Get a BIP-32 derivation path array from a hash, which is compatible with
 * `@metamask/key-tree`. The hash is assumed to be 32 bytes long.
 *
 * @param hash - The hash to derive indices from.
 * @returns The derived indices as a {@link HardenedBIP32Node} array.
 */
function getDerivationPathArray(hash: Uint8Array): HardenedBIP32Node[] {
  const array: HardenedBIP32Node[] = [];
  const view = createDataView(hash);

  for (let index = 0; index < 8; index++) {
    const uint32 = view.getUint32(index * 4);

    // This is essentially `index | 0x80000000`. Because JavaScript numbers are
    // signed, we use the bitwise unsigned right shift operator to ensure that
    // the result is a positive number.
    // eslint-disable-next-line no-bitwise
    const pathIndex = (uint32 | HARDENED_VALUE) >>> 0;
    array.push(`bip32:${pathIndex - HARDENED_VALUE}'` as const);
  }

  return array;
}

type DeriveEntropyOptions = {
  /**
   * The input value to derive entropy from.
   */
  input: string;

  /**
   * An optional salt to use when deriving entropy.
   */
  salt?: string;

  /**
   * The mnemonic phrase to use for entropy derivation.
   */
  mnemonicPhrase: string;

  /**
   * A hardened BIP-32 index, which is used to derive the root key from the
   * mnemonic phrase. If not provided, {@link SIP_6_MAGIC_VALUE} will be used.
   */
  magic?: `${number}'`;
};

/**
 * Derive entropy from the given mnemonic phrase and salt.
 *
 * This is based on the reference implementation of
 * [SIP-6](https://metamask.github.io/SIPs/SIPS/sip-6).
 *
 * @param options - The options for entropy derivation.
 * @param options.input - The input value to derive entropy from.
 * @param options.salt - An optional salt to use when deriving entropy.
 * @param options.mnemonicPhrase - The mnemonic phrase to use for entropy
 * derivation.
 * @param options.magic - A hardened BIP-32 index, which is used to derive the
 * root key from the mnemonic phrase. If not provided,
 * {@link SIP_6_MAGIC_VALUE} will be used.
 * @returns The derived entropy.
 */
export async function deriveEntropy({
  input,
  salt = '',
  mnemonicPhrase,
  magic = SIP_6_MAGIC_VALUE,
}: DeriveEntropyOptions): Promise<Hex> {
  const inputBytes = stringToBytes(input);
  const saltBytes = stringToBytes(salt);

  // Get the derivation path from the snap ID.
  const hash = keccak256(concatBytes([inputBytes, keccak256(saltBytes)]));
  const computedDerivationPath = getDerivationPathArray(hash);

  // Derive the private key using BIP-32.
  const { privateKey } = await SLIP10Node.fromDerivationPath({
    derivationPath: [
      `bip39:${mnemonicPhrase}`,
      `bip32:${magic}`,
      ...computedDerivationPath,
    ],
    curve: 'secp256k1',
  });

  // This should never happen, but this keeps TypeScript happy.
  assert(privateKey, 'Failed to derive the entropy.');

  return add0x(privateKey);
}
