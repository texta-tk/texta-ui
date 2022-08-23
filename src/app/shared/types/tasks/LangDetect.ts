import {TextaTask} from './TaskStatus';

interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}


export interface LangDetect {
  id: number;
  url: string;
  indices: Index[];
  description: string;
  tasks: TextaTask[];
  fields: string[];
}
