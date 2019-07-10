interface Field {
  path: string;
  type: string;
}

export class ProjectFields {
  index: string;
  fields: Field[];
}
