import { TaskStatus } from '../tasks/TaskStatus';

export interface Reindexer {
    id: number;
    url: string;
    description: string;
    query: string;
    new_index: string;
    random_size: number;
    task: TaskStatus;
    field_type_parsed: string[];
}
