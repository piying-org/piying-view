import * as v from 'valibot';
import { setComponent } from '../action';
/** NonFieldControl */
export const NFCSchema = v.optional(v.void());
export function nfcComponent(input: any) {
  return v.pipe(NFCSchema, setComponent(input));
}
