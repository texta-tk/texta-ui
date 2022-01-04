import {Author} from './Tagger';

interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}

 interface AnnotatorUser {
  url: string;
  id: number;
  username: string;
  email: string;
  display_name: string;
  date_joined: Date;
  last_login: Date;
  is_superuser: boolean;
  profile: {
    first_name?: string;
    last_name?: string;
    is_uaa_account: boolean;
    // tslint:disable-next-line:no-any
    scopes: any[];
    application: string;
  };
}

 interface BinaryConfiguration {
  id: number;
  fact_name: string;
  pos_value: string;
  neg_value: string;
}

 interface MultilabelConfiguration {
  id: number;
  labelset: number;
}

 interface EntityConfiguration {
  fact_name: string;
}
export interface Annotator {
  id: number;
  url: string;
  author: Author;
  description: string;
  indices: Index[];
  target_field: string;
  fields: string[];
  query: string;
  annotation_type: string;
  annotator_users: AnnotatorUser[];
  created_at: Date;
  modified_at: Date;
  completed_at: Date;
  total: number;
  annotated: number;
  skipped: number;
  validated: number;
  binary_configuration: BinaryConfiguration;
  multilabel_configuration: MultilabelConfiguration;
  entity_configuration: EntityConfiguration;
  bulk_size: number;
  es_timeout: number;
}
