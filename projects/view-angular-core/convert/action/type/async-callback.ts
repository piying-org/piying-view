import { Observable } from 'rxjs';
import { Signal } from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '../../../builder-base/type';

/**
 * 异步属性回调可接受的返回形态。
 *
 * 全项目唯一一份, 其余文件一律 import, 不再各自复制。
 * `T & {}` 用于放行「直接值」同时不吞掉 Promise/Observable/Signal 的推断候选。
 */
export type AsyncResult<T = any> =
  | Promise<T>
  | Observable<T>
  | Signal<T>
  | (T & {});

/**
 * 异步回调: field 由调用方决定。
 * F 默认保持旧的松散形态, 强类型场景(typedFieldPipe)显式传入路径推导出的字段类型。
 */
export type AsyncCallback<R, F = _PiResolvedCommonViewFieldConfig> = (
  field: F,
) => AsyncResult<R>;
