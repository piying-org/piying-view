import { NgSchemaHandle } from '@piying/view-angular';
import * as v from 'valibot';
import { SchemaOrPipe } from '@piying/valibot-visit';
export class JsonSchemaHandle extends NgSchemaHandle {
  override end(schema: SchemaOrPipe): void {
    super.end(schema);
    if (this.type === 'object') {
      this.type = 'strict_object';
    }
    if (this.type === 'array') {
      this.type = 'array-rw';
    }
    if (this.type === 'tuple') {
      this.type = 'strict_object';
    }
    if (this.type === 'tuple_with_rest') {
      this.type = 'strict_object';
    }
    if (this.type === 'multiselect') {
      this.attributes = {
        ...this.attributes,
        class: 'h-[200px]',
      };
    }
    if (this.type === 'oneOf-select') {
      this.props = { ...this.props, type: 'oneOf' };
    }
    if (this.type === 'anyOf-select') {
      this.props = {
        ...this.props,
        type: 'anyOf',
      };
    }
  }

  override validation(
    item: v.BaseValidation<any, any, v.BaseIssue<unknown>>,
  ): void {
    super.validation(item);
  }
}
