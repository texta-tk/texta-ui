export class Search {
  constructor(public searchContent: { count: number, results: { highlight: any, doc: any }[] }, public showShortVersion: boolean) {

  }

}
