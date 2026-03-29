import * as v from 'valibot';
import { setComponent } from '../action';
/** NonFieldControl
 * 建议使用 nfcComponent => v.pipe(NFCSchema,setComponent(xxx))
 */
export const NFCSchema = v.optional(v.void());
export function nfcComponent(input: any) {
  return v.pipe(NFCSchema, setComponent(input));
}
