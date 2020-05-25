export class SavedSearch {
  id: number;
  description = '';
  query: any;
  query_constraints: any[] | string; // stored as string in backend
  author = '';
  project: number;
}
