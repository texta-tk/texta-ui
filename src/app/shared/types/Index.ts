export interface Index {
  id: number;
  is_open: boolean;
  name: string;
  doc_count: number;
  size: number;
  url: string;
  added_by: string;
  client: string;
  description: string;
  created_at: string;
  source: string;
  domain: string;
  test: boolean;
  has_validated_facts: boolean;
}

interface Id {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface IsOpen {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  default: boolean;
  help_text?: string;
}

interface Url {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Name {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  max_length: number;
  help_text?: string;
}

interface Description {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

interface AddedBy {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

interface Test {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

interface Source {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

interface Client {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

interface Choice {
  value: string;
  display_name: string;
}

interface Domain {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  choices: Choice[];
  help_text?: string;
}

interface CreatedAt {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface POST {
  id: Id;
  is_open: IsOpen;
  url: Url;
  name: Name;
  description: Description;
  added_by: AddedBy;
  test: Test;
  source: Source;
  client: Client;
  domain: Domain;
  created_at: CreatedAt;
}

interface Actions {
  POST: POST;
}

export interface ElasticIndexOptionsResponse {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;
}
