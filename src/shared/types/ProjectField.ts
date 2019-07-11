export interface Field {
  path: string;
  type: string;
}

export class ProjectFields {
  index: string;
  fields: Field[];

  static isProjectFields(object): object is ProjectFields | ProjectFields[] {
    if (Array.isArray(object)) {
      return ((object[0] as ProjectFields).index !== undefined && (object[0] as ProjectFields).fields !== undefined);
    } else {
      return (object as ProjectFields).index !== undefined && (object as ProjectFields).fields !== undefined;
    }
  }
}
