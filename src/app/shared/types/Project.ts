// tslint:disable:variable-name
import {UserProfile} from './UserProfile';
import {Index} from './Index';

export class Project {
  url = '';
  id: number;
  title = '';
  owner: number;
  users: UserProfile[];
  indices: Index[];
  author: UserProfile;
  resource_count: number;
  administrators: UserProfile[];
  resources: {
    embeddings: number[];
    embedding_clusters: number[];
    taggers: number[];
  };
  scopes: string[];
}

export class ProjectResourceCounts {
  num_lexicons = 0;
  num_torchtaggers = 0;
  num_taggers = 0;
  num_tagger_groups = 0;
  num_embeddings = 0;
  num_clusterings = 0;
  num_regex_taggers = 0;
  num_regex_tagger_groups = 0;
  num_anonymizers = 0;
  num_mlp_workers = 0;
  num_reindexers = 0;
  num_dataset_importers = 0;
  num_bert_taggers = 0;
  num_index_splitters = 0;
  num_evaluators = 0;
  num_summarizers = 0;
  num_lang_detectors = 0;
  num_search_fields_taggers = 0;
  num_crf_extractors = 0;
  num_search_query_taggers = 0;
  num_elastic_analyzers = 0;
  num_rakun_keyword_extractors = 0;
  num_annotators = 0;
}

export interface ProjectFact {
  name: string;
  values: string[];
}

export interface Field {
  path: string;
  type: string;
}

export class ProjectIndex {
  index: string;
  fields: Field[];
  static cleanProjectIndicesFields(fields: ProjectIndex[], whiteList: string[], blackList: string[], whiteListAll?: boolean): ProjectIndex[] {
    fields = JSON.parse(JSON.stringify(fields)); // deep clone, dont want to change original
    const filteredField: ProjectIndex[] = [];
    const whiteListTypes = whiteList && whiteList.length > 0 ? whiteList : null;
    const blackListTypes = blackList && blackList.length > 0 ? blackList : null;
    for (const index of fields) {
      index.fields = index.fields.filter(element => {
          if (whiteListTypes && whiteListTypes.includes(element.type)) {
            return true;
          }
          if (blackListTypes && blackListTypes.includes(element.type)) {
            return false;
          }
          if (whiteListAll) {
            return true;
          }
        }
      );
      if (index.fields.length > 0) {
        filteredField.push(index);
      }
    }
    return filteredField;
  }

  static getFieldToIndexMap(projIndx: ProjectIndex[]): Map<string, string[]> {
    const outMap = new Map<string, string[]>();
    for (const indx of projIndx) {
      for (const fields of indx.fields) {
        if (outMap.has(fields.path)) {
          const prevIndices = outMap.get(fields.path);
          if (prevIndices) {
            outMap.set(fields.path, [...prevIndices, indx.index]);
          }
        } else {
          outMap.set(fields.path, [indx.index]);
        }
      }
    }
    return outMap;
  }
}


// for the project/{id}/heath endpoint
export interface Health {
  host: {
    cpu?: { percent: number; count: number; };
    gpu?: { count: number; devices: { id: number; memory: { free: number, total: number, used: number, unit: string }, name: string }[] };
    memory?: { free: number, total: number, used: number, unit: string };
    disk?: { free: number, total: number, used: number, unit: string };
  };
  toolkit: {
    active_tasks: number;
    version: string;
    available_langs: string[];
  };
  services: {
    elastic?: {
      url: string;
      alive: boolean;
      disk: { free: number, total: number, used: number, unit: string, host: string }[];
      status: {
        name: string;
        cluster_name: string;
        cluster_uuid: string;
        version: {
          number: string;
          build_flavor: string;
          build_type: string;
          build_hash: string;
          build_date: string;
          build_snapshot: boolean;
          lucene_version: string;
          minimum_wire_compatibility_version: string;
          minimum_index_compatibility_version: string;
        };
        tagline: string;
      };
    };
    mlp?: { url: string, alive: boolean, status: { loaded_entities: string[], version: string, service: string } };
    redis?: { alive: boolean, version: number, expired_keys: number, used_memory: string, total_memory: string };
  };
}

// this interface is for localstorage
export interface ProjectState {
  searcher: {
    itemsPerPage: number;
    selectedFields: string[];
    sidePanelsState: {buildSearch: boolean, savedSearch: boolean, aggregations: boolean}
    searcherType: 1 | 2;
    showShortVersion: boolean;
  };
  models: {
    tagger: { itemsPerPage: number; }
    embedding: { itemsPerPage: number; }
    torchTagger: { itemsPerPage: number; }
    taggerGroup: { itemsPerPage: number; }
    // tslint:disable-next-line:no-any
    clustering: { [clusteringID: string]: { selectedFields?: string[], charLimit?: number, sortDirection?: any } };
  };
  tasks: {};
  lexicons: { embeddingId: number | null; };
  global: { selectedIndices: string[] };
}
