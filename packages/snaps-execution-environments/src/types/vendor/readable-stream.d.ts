// eslint-disable-next-line import/unambiguous
declare module 'readable-stream' {
  export type { DuplexOptions, Readable, TransformCallback } from 'stream';
  export { Duplex, pipeline } from 'stream';
}
