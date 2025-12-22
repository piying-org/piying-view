import { actions as coreActions } from '@piying/view-angular-core';
import { directives } from './directive';

export * from './raw-config';
export {
  asControl,
  condition,
  asVirtualGroup,
  layout,
} from '@piying/view-angular-core';
export * from './directive';
const actions = { ...coreActions, directives };
export { actions };
