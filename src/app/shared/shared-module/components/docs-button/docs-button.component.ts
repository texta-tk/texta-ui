import {Component, Input, OnInit} from '@angular/core';

const docLinkMap = {
  // models
  bertCreate: 'https://docs.texta.ee/bert_tagger.html#parameters',
  crfCreate: 'https://docs.texta.ee',
  embeddingCreate: 'https://docs.texta.ee/embedding.html',
  rakunCreate: 'https://docs.texta.ee/rakun_keyword_extractor.html#parameters',
  regexTaggerGroupCreate: 'https://docs.texta.ee/regex_tagger_group.html#parameters',
  regexTaggerCreate: 'https://docs.texta.ee/regex_tagger.html#parameters',
  searchFieldsTaggerCreate: 'https://docs.texta.ee/search_fields_tagger.html#',
  searchQueryTaggerCreate: 'https://docs.texta.ee/search_query_tagger.html#parameters',
  taggerGroupCreate: 'https://docs.texta.ee/tagger_group.html#parameters',
  taggerCreate: 'https://docs.texta.ee/tagger.html#parameters',
  torchTaggerCreate: 'https://docs.texta.ee/torch_tagger.html#',
  // tools
  annotatorCreate: 'https://docs.texta.ee',
  anonymizerCreate: 'https://docs.texta.ee/anonymizer.html#parameters',
  datasetImporterCreate: 'https://docs.texta.ee/importer.html#parameters',
  esAnalyzerCreate: 'https://docs.texta.ee/es_analyzer.html#parameters',
  evaluatorCreate: 'https://docs.texta.ee/evaluator.html#parameters',
  indexSplitterCreate: 'https://docs.texta.ee/index_splitting_tool.html',
  languageDetectorCreate: 'https://docs.texta.ee/language_detector.html#parameters',
  mlpCreate: 'https://docs.texta.ee/mlp.html',
  reindexerCreate: 'https://docs.texta.ee/reindexer.html#parameters',
  summarizerCreate: 'https://docs.texta.ee/summarizer.html',
  topicAnalyzerCreate: 'https://docs.texta.ee/topic_analyzer.html',
  // core
  elasticIndexCreate: 'https://docs.texta.ee/index_creation.html#create-indices'
};

@Component({
  selector: 'app-docs-button',
  templateUrl: './docs-button.component.html',
  styleUrls: ['./docs-button.component.scss']
})
export class DocsButtonComponent implements OnInit {
  public docMap = docLinkMap;
  @Input() documentationArea: keyof typeof docLinkMap;

  constructor() {
  }

  ngOnInit(): void {
  }

}
