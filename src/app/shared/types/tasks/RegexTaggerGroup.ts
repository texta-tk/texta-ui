import {TextaTask} from './TaskStatus';
import {RegexTagger} from './RegexTagger';
import {UserProfile} from '../UserProfile';


export interface RegexTaggerGroup {
  id: number;
  url: string;
  regex_taggers: number[];
  author: UserProfile;

  tasks: TextaTask[];
  description: string;
  tagger_info: RegexTagger[];
  is_favorited: boolean;
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

export interface Tag {
  tagger_id: number;
  tag: string;
  matches: {
    str_val: string;
    span: number[];
  }[];
}

export interface RegexTaggerGroupMultiTagTextResult {
  tagger_group_id: number;
  tagger_group_tag: string;
  tags: Tag[];
}
