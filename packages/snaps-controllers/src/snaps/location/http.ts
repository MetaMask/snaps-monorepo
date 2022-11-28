import {
  SnapManifest,
  assertIsSnapManifest,
  VFile,
  deepClone,
  HttpSnapIdStruct,
} from '@metamask/snaps-utils';
import { assert, assertStruct } from '@metamask/utils';

import { SnapLocation } from './location';

export default class HttpLocation implements SnapLocation {
  // We keep contents separate because then we can use only one Blob in cache,
  // which we convert to Uint8Array when actually returning the file.
  //
  // That avoids deepCloning file contents.
  // I imagine ArrayBuffers are copy-on-write optimized, meaning
  // in most often case we'll only have one file contents in common case.
  private readonly cache: [file: VFile, contents: Blob][] = [];

  private validatedManifest?: VFile<SnapManifest>;

  private readonly url: URL;

  constructor(url: URL) {
    assertStruct(url.toString(), HttpSnapIdStruct, 'Invalid Snap Id: ');
    this.url = url;
  }

  async manifest(): Promise<VFile<SnapManifest>> {
    if (this.validatedManifest) {
      return deepClone(this.validatedManifest);
    }

    const contents = await (await fetch(this.url)).text();
    const manifest = JSON.parse(contents);
    assertIsSnapManifest(manifest);
    const vfile = new VFile<SnapManifest>({
      value: contents,
      result: manifest,
      path: './snap.manifest.json',
      data: { canonicalPath: this.url.toString() },
    });
    this.validatedManifest = vfile;

    return this.manifest();
  }

  async fetch(path: string): Promise<VFile> {
    const cached = this.cache.find(([file]) => file.path === path);
    if (cached !== undefined) {
      const [cachedFile, contents] = cached;
      const value = new Uint8Array(await contents.arrayBuffer());
      const vfile = deepClone(cachedFile);
      vfile.value = value;
      return vfile;
    }

    const canonicalPath = this.toCanonical(path).toString();
    const response = await fetch(canonicalPath);
    const vfile = new VFile({ value: '', path, data: { canonicalPath } });
    // TODO(ritave): When can we assume the file is string vs binary?
    const blob = await response.blob();
    this.cache.push([vfile, blob]);

    return this.fetch(path);
  }

  get root(): URL {
    return new URL(this.url);
  }

  private toCanonical(path: string): URL {
    assert(!path.startsWith('/'), 'Tried to parse absolute path');
    return new URL(path, this.url);
  }
}
