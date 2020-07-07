export class RegexTagger {
  id: number;
  description: string;
  lexicon: string[];
  counter_lexicon: string[];
  operator: string;
  match_type: string;
  required_words: number;
  phrase_slop: number;
  counter_slop: number;
  n_allowed_edits: number;
  return_fuzzy_match: boolean;
  ignore_case: boolean;
  ignore_punctuation: boolean;
}
