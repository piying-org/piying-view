import { AnyCoreSchemaHandle } from '../../convert';

export function isGroup(schema: AnyCoreSchemaHandle) {
  return schema.isGroup;
}
export function isArray(schema: AnyCoreSchemaHandle) {
  return schema.isArray;
}
