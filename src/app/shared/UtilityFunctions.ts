export function typeGuard<T>(o, className: { new(...args: any[]): T }): o is T {
  return o instanceof className;
}

