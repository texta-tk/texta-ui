export interface ShortTermTasks {
  active: number;
  reserved: number;
  scheduled: number;
}

export interface LongTermTasks {
  active: number;
  reserved: number;
  scheduled: number;
}

export interface MlpQueue {
  active: number;
  reserved: number;
  scheduled: number;
}

export interface CeleryCountTasks {
  short_term_tasks: ShortTermTasks;
  long_term_tasks: LongTermTasks;
  mlp_queue: MlpQueue;
}

export interface CeleryStatus {
  // tslint:disable-next-line:no-any
  active: { [key: string]: CeleryTask[] };
  // tslint:disable-next-line:no-any
  reserved: { [key: string]: CeleryTask[] };
}

interface DeliveryInfo {
  exchange: string;
  routing_key: string;
  priority: number;
  redelivered?: any;
}

export interface CeleryTask {
  id: string;
  name: string;
  args: number[];
  // tslint:disable-next-line:no-any
  kwargs: any;
  type: string;
  hostname: string;
  time_start: number;
  acknowledged: boolean;
  delivery_info: DeliveryInfo;
  worker_pid: number;
}
