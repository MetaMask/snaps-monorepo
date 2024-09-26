import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { createWindow } from '@metamask/snaps-utils';

import type {
  ExecutionServiceArgs,
  TerminateJobArgs,
} from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';

type IframeExecutionEnvironmentServiceArgs = {
  iframeUrl: URL;
} & ExecutionServiceArgs;

export class IframeExecutionService extends AbstractExecutionService<Window> {
  public iframeUrl: URL;

  constructor({
    iframeUrl,
    messenger,
    setupSnapProvider,
  }: IframeExecutionEnvironmentServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
    });
    this.iframeUrl = iframeUrl;
  }

  protected terminateJob(jobWrapper: TerminateJobArgs<Window>): void {
    document.getElementById(jobWrapper.id)?.remove();
  }

  protected async initEnvStream(jobId: string): Promise<{
    worker: Window;
    stream: BasePostMessageStream;
  }> {
    const iframeWindow = await createWindow({
      uri: this.iframeUrl.toString(),
      id: jobId,
    });

    const stream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
      targetWindow: iframeWindow,
      targetOrigin: '*',
    });

    return { worker: iframeWindow, stream };
  }
}
