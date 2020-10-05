import {TaskStatus} from './TaskStatus';

export interface TaggerInfo {
  tagger_id: number;
  description: string;
}

export interface RegexTaggerGroup {
  id: number;
  url: string;
  regex_taggers: number[];
  author_username: string;
  task: TaskStatus;
  description: string;
  tagger_info: TaggerInfo[];
}

export interface Match {
  fact: string;
  str_val: string;
  doc_path: string;
  spans: string | number[];
  tagger_id: number;
  source: string;
}

export interface RegexTaggerGroupTagTextResult {
  tagger_group_id: number;
  tagger_group_tag: string;
  result: boolean;
  tags: unknown[];
  matches: Match[];
  text: string;
}


export interface RegexTaggerTagTextResult {
  tagger_id: number;
  tag: string;
  result: boolean;
  tags: unknown[];
  matches: Match[];
  text: string;
}

export interface RegexTaggerGroupTagRandomDocResult {
  tagger_group_id: number;
  tagger_group_tag: string;
  result: boolean;
  tags: unknown[];
  matches: Match[];
  document: { [key: string]: unknown };
}
export interface RegexTaggerTagRandomDocResult {
  tagger_id: number;
  tag: string;
  result: boolean;
  tags: unknown[];
  matches: Match[];
  document: { [key: string]: unknown };
}
export interface RegexTaggerGroupMultiTagTextResult {
  tagger_group_id: number;
  tagger_group_tag: string;
  result: boolean;
  tags: unknown[];
  matches: Match[];
  text: string;
}
