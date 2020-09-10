
export interface TaggerInfo {
  tagger_id: number;
  description: string;
}

export interface RegexTaggerGroup {
  id: number;
  url: string;
  regex_taggers: number[];
  author_username: string;
  task?: unknown;
  description: string;
  tagger_info: TaggerInfo[];
}
