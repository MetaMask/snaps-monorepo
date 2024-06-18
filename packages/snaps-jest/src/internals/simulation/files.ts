import type { File } from '@metamask/snaps-sdk';
import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import type { VirtualFile } from '@metamask/snaps-utils';
import { encodeAuxiliaryFile, normalizeRelative } from '@metamask/snaps-utils';
import { bytesToBase64 } from '@metamask/utils';
import { readFile } from 'fs/promises';
import mime from 'mime';
import { basename, extname, resolve } from 'path';

/**
 * Get a statically defined Snap file from an array of files.
 *
 * @param files - The Snap files.
 * @param path - The file path.
 * @param encoding - The requested file encoding.
 * @returns The file in the requested encoding if found, otherwise null.
 */
export async function getSnapFile(
  files: VirtualFile[],
  path: string,
  encoding: AuxiliaryFileEncoding = AuxiliaryFileEncoding.Base64,
) {
  const normalizedPath = normalizeRelative(path);
  const base64 = files
    .find((file) => file.path === normalizedPath)
    ?.toString('base64');

  if (!base64) {
    return null;
  }

  return await encodeAuxiliaryFile(base64, encoding);
}

/**
 * Get the content type of a file based on its extension.
 *
 * @param extension - The file extension.
 * @returns The content type of the file. If the content type cannot be inferred
 * from the extension, `application/octet-stream` is returned.
 */
function getContentType(extension: string) {
  return mime.getType(extension) ?? 'application/octet-stream';
}

/**
 * Get a file object to upload, from a file path or a `Uint8Array`, with an
 * optional file name and content type.
 *
 * @param file - The file to upload. This can be a path to a file or a
 * `Uint8Array` containing the file contents. If this is a path, the file is
 * resolved relative to the current working directory.
 * @param fileName - The name of the file. By default, this is inferred from the
 * file path if it's a path, and defaults to an empty string if it's a
 * `Uint8Array`.
 * @param contentType - The content type of the file. By default, this is
 * inferred from the file name if it's a path, and defaults to
 * `application/octet-stream` if it's a `Uint8Array` or the content type cannot
 * be inferred from the file name.
 */
export async function getFileToUpload(
  file: string | Uint8Array,
  fileName?: string,
  contentType?: string,
): Promise<File> {
  if (typeof file === 'string') {
    const buffer = await readFile(resolve(process.cwd(), file));

    return {
      name: fileName ?? basename(file),
      size: buffer.byteLength,
      contentType: contentType ?? getContentType(extname(file)),
      contents: bytesToBase64(buffer),
    };
  }

  return {
    name: fileName ?? '',
    size: file.length,
    contentType: contentType ?? 'application/octet-stream',
    contents: bytesToBase64(file),
  };
}
