/// <reference lib="webworker" />

import {ClusterDocument} from '../../../../../shared/types/tasks/Cluster';
import {SearcherOptions} from '../../../../../searcher/SearcherOptions';

addEventListener('message', (data) => {
  // This is running in the web-worker
  const context: { words: { key: string, count: number }[], docs: ClusterDocument[], accessor: string } = data.data;
  const sigWords = context.words.map(x => x.key);
  const docAccessor = context.accessor ? context.accessor : '';
  for (const doc of context.docs) {
    doc['highlight'] = {};
    for (const col in doc[docAccessor]) {
      if (doc[docAccessor].hasOwnProperty(col) && doc[docAccessor][col] && typeof doc[docAccessor][col] === 'string') {
        const textSplit = doc[docAccessor][col].trim().split(/(\b[^\s]+\b)/);
        doc['highlight'][col] = [''];
        for (const word of textSplit) {
          if (word && sigWords.includes(word)) {
            const wordToAdd = SearcherOptions.PRE_TAG + word + SearcherOptions.POST_TAG;
            doc['highlight'][col][0] = doc['highlight'][col][0] + wordToAdd;
          } else {
            doc['highlight'][col][0] = doc['highlight'][col][0] + word;
          }
        }
      }
    }
  }
  postMessage(context);
});

