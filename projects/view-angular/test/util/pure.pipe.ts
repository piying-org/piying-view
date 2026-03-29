import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pure',
  standalone: true,
})
export class PurePipe implements PipeTransform {
  transform<T extends (...args: any[]) => any>(fn: T, ...args: Parameters<T>) {
    return fn(...args) as ReturnType<T>;
  }
}
