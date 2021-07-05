
export class SignificantWordsWorker {
  static worker = new Worker(new URL('./web-worker.worker', import .meta.url), {type: 'module'});
}
