import { Duplex } from 'stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { ObservableStore } from '@metamask/obs-store';
import ObjectMultiplex from '@metamask/object-multiplex';
import { WorkerParentPostMessageStream } from '@metamask/post-message-stream';
import { SNAP_STREAM_NAMES } from '@metamask/snap-workers';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { SnapData, ServiceMessenger } from '@metamask/snap-types';
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ExecutionEnvironmentService } from './ExecutionEnvironmentService';

export type SetupSnapProvider = (snapName: string, stream: Duplex) => void;

interface WorkerControllerArgs {
  setupSnapProvider: SetupSnapProvider;
  workerUrl: URL;
  messenger: ServiceMessenger;
  unresponsivePollingInterval?: number;
  unresponsiveTimeout?: number;
}

interface WorkerStreams {
  command: Duplex;
  rpc: Duplex | null;
  _connection: WorkerParentPostMessageStream;
}

// The snap is the callee
export type SnapRpcHook = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

interface WorkerWrapper {
  id: string;
  streams: WorkerStreams;
  rpcEngine: JsonRpcEngine;
  worker: Worker;
}

export class WebWorkerExecutionEnvironmentService
  implements ExecutionEnvironmentService
{
  public store: ObservableStore<{ workers: Record<string, WorkerWrapper> }>;

  private _snapRpcHooks: Map<string, SnapRpcHook>;

  private workerUrl: URL;

  private workers: Map<string, WorkerWrapper>;

  private setupSnapProvider: SetupSnapProvider;

  private snapToWorkerMap: Map<string, string>;

  private workerToSnapMap: Map<string, string>;

  private _messenger: ServiceMessenger;

  private _unresponsivePollingInterval: number;

  private _unresponsiveTimeout: number;

  private _timeoutForUnresponsiveMap: Map<string, number>;

  constructor({
    setupSnapProvider,
    workerUrl,
    messenger,
    unresponsivePollingInterval = 5000,
    unresponsiveTimeout = 30000,
  }: WorkerControllerArgs) {
    this.workerUrl = workerUrl;
    this.setupSnapProvider = setupSnapProvider;
    this.store = new ObservableStore({ workers: {} });
    this.workers = new Map();
    this.snapToWorkerMap = new Map();
    this.workerToSnapMap = new Map();
    this._snapRpcHooks = new Map();
    this._messenger = messenger;
    this._unresponsivePollingInterval = unresponsivePollingInterval;
    this._unresponsiveTimeout = unresponsiveTimeout;
    this._timeoutForUnresponsiveMap = new Map();
  }

  private _setWorker(workerId: string, workerWrapper: WorkerWrapper): void {
    this.workers.set(workerId, workerWrapper);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
      [workerId]: workerWrapper,
    };
    this.store.updateState({ workers: newWorkerState });
  }

  private _deleteWorker(workerId: string): void {
    this.workers.delete(workerId);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
    };
    delete newWorkerState[workerId];
    this.store.updateState({ workers: newWorkerState });
  }

  private async _command(
    workerId: string,
    message: JsonRpcRequest<unknown>,
  ): Promise<unknown> {
    if (typeof message !== 'object') {
      throw new Error('Must send object.');
    }

    const workerWrapper = this.workers.get(workerId);
    if (!workerWrapper) {
      throw new Error(`Worker with id ${workerId} not found.`);
    }

    console.log('Parent: Sending Command', message);
    const response: PendingJsonRpcResponse<unknown> =
      await workerWrapper.rpcEngine.handle(message);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.result;
  }

  async terminateAllSnaps() {
    for (const workerId of this.workers.keys()) {
      this.terminate(workerId);
    }
    this._snapRpcHooks.clear();
  }

  async terminateSnap(snapName: string) {
    const workerId = this.snapToWorkerMap.get(snapName);
    workerId && this.terminate(workerId);
    this._removeSnapHooks(snapName);
  }

  terminate(workerId: string): void {
    const workerWrapper = this.workers.get(workerId);
    const snapName = this._getSnapForWorker(workerId);
    if (!workerWrapper) {
      throw new Error(`Worker with id "${workerId}" not found.`);
    }

    if (!snapName) {
      throw new Error(`Snap name for Worker with id "${workerId}" not found.`);
    }

    Object.values(workerWrapper.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (err) {
        console.log('Error while destroying stream', err);
      }
    });
    workerWrapper.worker.terminate();
    this._removeSnapAndWorkerMapping(workerId);
    this._deleteWorker(workerId);

    clearTimeout(this._timeoutForUnresponsiveMap.get(workerId));
    this._timeoutForUnresponsiveMap.delete(workerId);

    console.log(`worker:${workerId} terminated`);
  }

  /**
   * Gets the RPC message handler for the given snap.
   *
   * @param snapName - The name of the snap whose message handler to get.
   */
  async getRpcMessageHandler(snapName: string) {
    return this._snapRpcHooks.get(snapName);
  }

  private _removeSnapHooks(snapName: string) {
    this._snapRpcHooks.delete(snapName);
  }

  private _createSnapHooks(snapName: string, workerId: string) {
    const rpcHook = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      return await this._command(workerId, {
        id: nanoid(),
        jsonrpc: '2.0',
        method: 'snapRpc',
        params: {
          origin,
          request,
          target: snapName,
        },
      });
    };

    this._snapRpcHooks.set(snapName, rpcHook);
  }

  async executeSnap(snapData: SnapData): Promise<unknown> {
    if (this.snapToWorkerMap.has(snapData.snapName)) {
      throw new Error(`Snap "${snapData.snapName}" is already being executed.`);
    }

    const worker = await this._initWorker();
    this._mapSnapAndWorker(snapData.snapName, worker.id);
    this.setupSnapProvider(
      snapData.snapName,
      worker.streams.rpc as unknown as Duplex,
    );

    const result = await this._command(worker.id, {
      jsonrpc: '2.0',
      method: 'executeSnap',
      params: snapData,
      id: nanoid(),
    });
    // set up poll/ping for status to see if its up, if its not then emit event that it cant be reached
    this._pollForWorkerStatus(snapData.snapName);
    this._createSnapHooks(snapData.snapName, worker.id);
    return result;
  }

  _pollForWorkerStatus(snapName: string) {
    const workerId = this._getWorkerForSnap(snapName);
    if (!workerId) {
      throw new Error('no worker id found for snap');
    }

    const timeout = window.setTimeout(async () => {
      this._getWorkerStatus(workerId)
        .then(() => {
          this._pollForWorkerStatus(snapName);
        })
        .catch(() => {
          this._messenger.publish('ServiceMessenger:unresponsive', snapName);
        });
    }, this._unresponsivePollingInterval);
    this._timeoutForUnresponsiveMap.set(snapName, timeout);
  }

  async _getWorkerStatus(workerId: string) {
    let resolve: any;
    let reject: any;

    const timeoutPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const timeout = window.setTimeout(() => {
      reject(new Error('ping request timed out'));
    }, this._unresponsiveTimeout);

    return Promise.race([
      this._command(workerId, {
        jsonrpc: '2.0',
        method: 'ping',
        params: [],
        id: nanoid(),
      }).then(() => {
        clearTimeout(timeout);
        resolve();
      }),
      timeoutPromise,
    ]);
  }

  _mapSnapAndWorker(snapName: string, workerId: string): void {
    this.snapToWorkerMap.set(snapName, workerId);
    this.workerToSnapMap.set(workerId, snapName);
  }

  /**
   * @returns The ID of the snap's worker.
   */
  _getWorkerForSnap(snapName: string): string | undefined {
    return this.snapToWorkerMap.get(snapName);
  }

  /**
   * @returns The ID worker's snap.
   */
  _getSnapForWorker(workerId: string): string | undefined {
    return this.workerToSnapMap.get(workerId);
  }

  _removeSnapAndWorkerMapping(workerId: string): void {
    const snapName = this.workerToSnapMap.get(workerId);
    if (!snapName) {
      throw new Error(`worker:${workerId} has no mapped snap.`);
    }

    this.workerToSnapMap.delete(workerId);
    this.snapToWorkerMap.delete(snapName);
  }

  private async _initWorker(): Promise<WorkerWrapper> {
    const workerId = nanoid();
    const worker = new Worker(this.workerUrl, {
      name: workerId,
    });
    // Handle out-of-band errors, i.e. errors thrown from the snap outside of the req/res cycle.
    const errorHandler = (ev: ErrorEvent) => {
      if (this._messenger) {
        const snapName = this.workerToSnapMap.get(workerId);
        if (snapName) {
          this._messenger.publish('ServiceMessenger:unhandledError', snapName, {
            code: ev.error.code,
            message: ev.error.message,
            data: ev.error.data,
          });
        }
      }
    };
    worker.addEventListener('error', errorHandler, { once: true });
    const streams = this._initWorkerStreams(worker, workerId);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

    rpcEngine.push(jsonRpcConnection.middleware);

    const workerWrapper = {
      id: workerId,
      streams,
      rpcEngine,
      worker,
    };
    this._setWorker(workerId, workerWrapper);

    await this._command(workerId, {
      jsonrpc: '2.0',
      method: 'ping',
      id: nanoid(),
    });

    return workerWrapper;
  }

  _initWorkerStreams(worker: Worker, workerId: string): WorkerStreams {
    const workerStream = new WorkerParentPostMessageStream({ worker });
    // Typecast justification: stream type mismatch
    const mux = setupMultiplex(
      workerStream as unknown as Duplex,
      `Worker:${workerId}`,
    );

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);

    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    // Typecast: stream type mismatch
    return {
      command: commandStream as unknown as Duplex,
      rpc: rpcStream,
      _connection: workerStream,
    };
  }
}

/**
 * Sets up stream multiplexing for the given stream.
 *
 * @param {any} connectionStream - the stream to mux
 * @param {string} streamName - the name of the stream, for identification in errors
 * @return {stream.Stream} the multiplexed stream
 */
function setupMultiplex(
  connectionStream: Duplex,
  streamName: string,
): ObjectMultiplex {
  const mux = new ObjectMultiplex();
  pump(
    connectionStream,
    // Typecast: stream type mismatch
    mux as unknown as Duplex,
    connectionStream,
    (err) => {
      if (err) {
        streamName
          ? console.error(`${streamName} stream failure.`, err)
          : console.error(err);
      }
    },
  );
  return mux;
}
