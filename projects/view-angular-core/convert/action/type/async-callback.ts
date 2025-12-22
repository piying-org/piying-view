import { Observable } from 'rxjs';
import { Signal } from 'static-injector';

export type AsyncCallback<R> = (
  ...args: any[]
) => Promise<R> | Observable<R> | Signal<R> | (R & {});
