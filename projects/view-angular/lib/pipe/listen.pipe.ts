import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'listen' })
export class ListenPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return [value, ...args];
  }
}
@Pipe({ name: 'inputKeys' })
export class InputsPipe implements PipeTransform {
  transform(value: Record<string,any>) {
    return Object.keys(value).join('|')
  }
}
