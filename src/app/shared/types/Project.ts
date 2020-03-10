export class Project {
  url = '';
  id: number;
  title = '';
  owner: number;
  users: string[];
  indices: string[];
  resources: {
    embeddings: number[];
    embedding_clusters: number[];
    taggers: number[];
  };
}

export interface ProjectResourceCounts {
  num_lexicons: number;
  num_taggers: number;
  num_tagger_groups: number;
  num_neurotaggers: number;
  num_embeddings: number;
  num_embedding_clusters: number;
  num_torchtaggers?: number;
}

export interface ProjectFact {
  name: string;
  values: string[];
}

export interface Field {
  path: string;
  type: string;
}

export class ProjectField {
  index: string;
  fields: Field[];

  static sortTextaFactsAsFirstItem(fields: ProjectField[]): ProjectField[] {
    fields = JSON.parse(JSON.stringify(fields)); // deep clone, dont want to change original
    return fields.map((field: ProjectField) => {
      field.fields.sort((x, y) => (x.type === 'fact' ? -1 : y.type === 'fact' ? 1 : 0));
      return field;
    });
  }

  static isProjectFields(object): object is ProjectField | ProjectField[] {
    if (Array.isArray(object) && object.length > 0) {
      return (
        (object[0] as ProjectField).index !== undefined &&
        (object[0] as ProjectField).fields !== undefined
      );
    } else {
      return (
        (object as ProjectField).index !== undefined &&
        (object as ProjectField).fields !== undefined
      );
    }
  }

  static cleanProjectFields(fields: ProjectField[], whiteList: string[], blackList: string[]): ProjectField[] {
    fields = JSON.parse(JSON.stringify(fields)); // deep clone, dont want to change original
    const filteredField: ProjectField[] = [];
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
      });
      if (index.fields.length > 0) {
        filteredField.push(index);
      }
    }
    return filteredField;
  }
}

// for the project/{id}/heath endpoint
export interface Health {
  elastic: {
    url: string;
    alive: boolean;
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
  redis: { alive: boolean, version: number, expired_keys: number, used_memory: string, total_memory: string };
  mlp: { url: string, alive: boolean };
  version: string;
  disk: { free: number, total: number, used: number, unit: string };
  memory: { free: number, total: number, used: number, unit: string };
  cpu: { percent: number };
  gpu: { count: number; devices: string[] };
  active_tasks: number;
}

// this interface is for localstorage
export interface ProjectState {
  searcher: {
    itemsPerPage: number;
    selectedFields: string[];
  };
  models: {
    tagger: { itemsPerPage: number; }
    embedding: { itemsPerPage: number; }
    torchTagger: { itemsPerPage: number; }
    taggerGroup: { itemsPerPage: number; }
  };
  tasks: {};
  lexicons: { embeddingId: number | null; };
  global: { selectedIndices: string[] };
}
