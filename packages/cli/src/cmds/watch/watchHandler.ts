import chokidar from 'chokidar';
import { YargsArgs } from '../../types/yargs';
import {
  getOutfilePath,
  loadConfig,
  logError,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} from '../../utils';
import { bundle } from '../build/bundle';
import { snapEval } from '../eval/evalHandler';
import { manifestHandler } from '../manifest/manifestHandler';
import { serve } from '../serve/serveHandler';

/**
 * Watch a directory and its subdirectories for changes, and build when files
 * are added or changed.
 *
 * Ignores 'node_modules' and dotfiles.
 * Creates destination directory if it doesn't exist.
 *
 * @param argv - arguments as an object generated by yargs
 * @param argv.src - The source file path
 * @param argv.dist - The output directory path
 * @param argv.'outfileName' - The output file name
 */
export async function watch(argv: YargsArgs): Promise<void> {
  const {
    dist,
    eval: shouldEval,
    manifest,
    outfileName,
    src,
    serve: shouldServe,
  } = argv;
  if (outfileName) {
    validateOutfileName(outfileName as string);
  }
  await validateFilePath(src);
  await validateDirPath(dist, true);
  const rootDir =
    src.indexOf('/') === -1 ? '.' : src.substring(0, src.lastIndexOf('/') + 1);
  const outfilePath = getOutfilePath(dist, outfileName as string);

  const buildSnap = async (path?: string, logMessage?: string) => {
    if (logMessage !== undefined) {
      console.log(logMessage);
    }

    try {
      await bundle(src, outfilePath, argv, loadConfig().bundlerCustomizer);

      if (manifest) {
        await manifestHandler(argv);
      }

      if (shouldEval) {
        await snapEval({ ...argv, bundle: outfilePath });
      }
    } catch (error) {
      logError(
        `Error ${
          path === undefined
            ? 'during initial build'
            : `while processing "${path}"`
        }.`,
        error,
      );
    }
  };

  chokidar
    .watch(rootDir, {
      ignoreInitial: true,
      ignored: [
        '**/node_modules/**',
        `**/${dist}/**`,
        `**/test/**`,
        `**/tests/**`,
        `**/*.test.js`,
        `**/*.test.ts`,
        /* istanbul ignore next */
        (str: string) => str !== '.' && str.startsWith('.'),
      ],
    })

    .on('ready', async () => {
      await buildSnap();
      if (shouldServe) {
        await serve(argv);
      }
    })
    .on('add', (path) => buildSnap(path, `File added: ${path}`))
    .on('change', (path) => buildSnap(path, `File changed: ${path}`))
    .on('unlink', (path) => console.log(`File removed: ${path}`))
    .on('error', (error: Error) => {
      logError(`Watcher error: ${error.message}`, error);
    })

    .add(rootDir);

  console.log(`Watching '${rootDir}' for changes...`);
}
