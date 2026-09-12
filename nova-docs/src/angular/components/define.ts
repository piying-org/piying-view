import {
  actions,
  type PiViewConfig,
  PiyingViewGroup,
} from '@piying/view-angular';
import { FieldsetFGC } from './fieldset/component';
import { ButtonLinkComponent } from './link/component';
import { ValidWC } from './wrapper/valid/component';
import { DropdownComponent } from './dropdown/component';
import { FormlyFieldWC } from './wrapper/formly-field-wrapper/component';
import { JoinItemWC } from './wrapper/join-wrapper/component';
import { PanelWC } from './wrapper/panel-wrapper/component';
import { TooltipWC } from './wrapper/tooltip/component';
import { DemoNFCC } from './demo';
import { LogNFCC } from './log';
import { SimpleInputC } from './simple-input';
import { SelectorlessNFCC } from './selector-less';
import * as FCCGroup from '@piying-lib/angular-daisyui/field-control';
import { LabelWC } from '@piying-lib/angular-daisyui/wrapper';
import { DivNFCC, DivWC } from '@piying-lib/angular-core';
import { setComponent } from '@piying/view-angular-core';
import {
  PresetDefine,
  FormInputWithValidate,
} from '@piying-lib/angular-daisyui/preset';

const LazyRestGroup = () =>
  import('./group/rest-group/component').then((item) => item.default);
const selectActions = [
  setComponent(FCCGroup.SelectFCC),
  actions.wrappers.set([{ type: 'label' }]),
  actions.inputs.mapAsync((field) => {
    const props = field.props;
    return (value) => ({ options: props()['options'], ...value });
  }),
];
export const FieldGlobalConfig = {
  types: {
    ...PresetDefine.types,
    ...FormInputWithValidate,
    radio: {
      type: () =>
        import('@piying-lib/angular-daisyui/field-control').then(
          (a) => a.RadioFCC,
        ),
    },

    fieldset: {
      type: FieldsetFGC,
    },

    multiselect: {
      actions: [...selectActions, actions.inputs.set({ multiple: true })],
    },
    'multiselect-repeat': {
      actions: [...selectActions, actions.inputs.set({ multiple: true })],
    },
    dropdown: {
      type: DropdownComponent,
      actions: [
        actions.attributes.set({
          type: 'dropdown',
          class: 'dropdown',
        }),
      ],
    },

    restGroup: {
      type: LazyRestGroup,
    },
    strict_object: {
      type: LazyRestGroup,
    },
    loose_object: {
      type: LazyRestGroup,
    },
    object_with_rest: {
      type: LazyRestGroup,
    },
    array: {
      type: LazyRestGroup,
    },
    tuple: {
      type: LazyRestGroup,
    },
    strict_tuple: {
      type: LazyRestGroup,
    },
    loose_tuple: {
      type: LazyRestGroup,
    },
    tuple_with_rest: {
      type: LazyRestGroup,
    },
    record: {
      type: LazyRestGroup,
    },
    'oneOf-condition': {
      type: LazyRestGroup,
    },
    'anyOf-condition': {
      type: LazyRestGroup,
    },
    union: {
      type: LazyRestGroup,
    },
    intersect: {
      type: PiyingViewGroup,
    },
    group: {
      type: PiyingViewGroup,
    },
    simpleInput: {
      type: SimpleInputC,
    },

    codeEditor: {
      type: () =>
        import('./monaco-editor/component').then((item) => item.default),
      actions: [
        actions.attributes.set({
          type: 'code-editor',
          class: 'h-full',
        }),
      ],
    },
    jsonEditor: {
      type: () =>
        import('./json-monaco-editor/component').then((item) => item.default),
      actions: [
        actions.attributes.set({
          type: 'json-editor',
          class: 'h-full',
        }),
      ],
    },
    evalView: {
      type: () =>
        import('./playground-eval-view/component').then(
          (a) => a.PlayGroundEvalViewNFCC,
        ),
    },
    button: {
      type: () =>
        import('@piying-lib/angular-daisyui/non-field-control').then(
          (a) => a.ButtonNFCC,
        ),
    },
    'button-link': {
      type: ButtonLinkComponent,
    },
    block: {
      type: DivNFCC,
    },
    'array-rw': {
      type: () => import('./array-rw/component').then((a) => a.default),
    },
    tabs: {
      type: () => import('./tag-group/component').then((a) => a.default),
    },
    steps: {
      type: () => import('./step-group/component').then((a) => a.default),
    },
    validGroup: {
      type: () => import('./valid-group/component').then((a) => a.default),
    },
    filterGroup: {
      type: () => import('./filter-group/component').then((a) => a.default),
    },
    scrollGroup: {
      type: () => import('./scroll-group/component').then((a) => a.default),
    },
    'formly-custom-input-1': {
      type: () =>
        import('./formly-custom-input-1/component').then((a) => a.default),
    },
    formHelper: {
      type: () => import('./form-helper/component').then((a) => a.default),
    },
    divider: {
      type: DivNFCC,
      actions: [
        actions.attributes.set({
          class: 'divider',
        }),
      ],
    },
    jsonSchema: {
      type: () => import('./json-schema/component').then((a) => a.default),
    },
    'logic-group': {
      type: () => import('./logic-group/component').then((a) => a.default),
    },
    'anyOf-select': {
      type: () => import('./logic-group/component').then((a) => a.default),
    },
    'oneOf-select': {
      type: () => import('./logic-group/component').then((a) => a.default),
    },
    null: {
      type: () => import('./null/component').then((a) => a.default),
    },
    any: {
      type: () => import('./null/component').then((a) => a.default),
    },

    date: {
      type: () =>
        import('@piying-lib/angular-daisyui/field-control').then(
          (a) => a.InputFCC,
        ),
      actions: [
        actions.inputs.patch({
          type: 'date',
        }),
      ],
    },
    salutation: {
      actions: [
        ...selectActions,
        actions.attributes.set({
          placeholder: 'Please Select',
        }),
        actions.props.set({
          title: 'Salutation',
        }),
        actions.inputs.set({
          options: ['Mr.', 'Ms.', 'Dr.', 'Dude'],
        }),
      ],
    },
    firstName: {
      type: FCCGroup.InputFCC,
      actions: [
        actions.props.set({
          title: 'First Name',
        }),
      ],
    },
    lastName: {
      type: FCCGroup.InputFCC,
      actions: [
        actions.props.set({
          title: 'Last Name',
        }),
      ],
    },
    demo: {
      type: DemoNFCC,
    },
    log: {
      type: LogNFCC,
    },
    'selectorless-demo': {
      type: SelectorlessNFCC,
      actions: [
        actions.props.patch({
          labelPosition: 'left',
        }),
      ],
    },
  },
  wrappers: {
    ...PresetDefine.wrappers,
    validator: {
      type: ValidWC,
    },
    formlyField: {
      type: FormlyFieldWC,
    },
    joinItem: {
      type: JoinItemWC,
    },
    panel: {
      type: PanelWC,
    },
    label: {
      type: LabelWC,
    },
    'jsonschema-label': {
      type: LabelWC,
    },
    tooltip: {
      type: TooltipWC,
    },
    block: {
      type: DivWC,
    },
  },
} as PiViewConfig;
