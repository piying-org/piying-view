import { Subscribable } from 'rxjs';

export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return !!obj && typeof obj.then === 'function';
}
export function isSubscribable<T>(obj: any): obj is Subscribable<T> {
  return !!obj && typeof obj.subscribe === 'function';
}
