export interface Field {
  path: string;
  type: string;
}

export class ProjectField {
  index: string;
  fields: Field[];

  static isProjectFields(object): object is ProjectField | ProjectField[] {
    if (Array.isArray(object)) {
      return ((object[0] as ProjectField).index !== undefined && (object[0] as ProjectField).fields !== undefined);
    } else {
      return (object as ProjectField).index !== undefined && (object as ProjectField).fields !== undefined;
    }
  }

  static cleanProjectFields(fields: ProjectField[]): ProjectField[] {
    const filteredField: ProjectField[] = [];
    for (const index of fields) {
      index.fields = index.fields.filter(element => {
        return element.type !== 'fact' &&
          element.path !== '_texta_id' &&
          element.type !== 'float' &&
          element.type !== 'boolean';
      });
      if (index.fields.length > 0) {
        filteredField.push(index);
      }
    }
    return filteredField;
  }
}
