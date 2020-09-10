
export class SignificantWordsWorker {
  static worker = new Worker('./web-worker.worker', {type: 'module'});
}
