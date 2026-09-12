import type { BaseSchema } from 'valibot';
import * as typeStringDef from './type-string.definition';
import * as typeNumberDef from './type-number.definition';
import * as typeBooleanDef from './type-boolean.definition';
import * as typePicklistDef from './type-picklist.definition';
import * as typeObjectDef from './type-object.definition';
import * as looseObjectDef from './loose-object.definition';
import * as objectWithRestDef from './object-with-rest.definition';
import * as objectGroupDefaultDef from './object-group-default.definition';
import * as objectGroupLooseDef from './object-group-loose.definition';
import * as objectGroupStrictDef from './object-group-strict.definition';
import * as objectGroupVirtualModeDef from './object-group-virtual-mode.definition';
import * as objectGroupEmptyValueDef from './object-group-empty-value.definition';
import * as recordDef from './record.definition';
import * as typeArrayDef from './type-array.definition';
import * as tupleDef from './tuple.definition';
import * as looseTupleDef from './loose-tuple.definition';
import * as tupleWithRestDef from './tuple-with-rest.definition';
import * as defaultValueDef from './default-value.definition';
import * as nestedObjectDef from './nested-object.definition';
import * as componentUseDef from './component-use.definition';
import * as nfcDef from './nfc.definition';
import * as actionDef from './action.definition';
import * as eventsDef from './events.definition';
import * as apiCssClassDef from './api-css-class.definition';
import * as apiAttributesDef from './api-attributes.definition';
import * as contextDef from './context.definition';
import * as rawDef from './raw.definition';
import * as selectorlessDef from './selectorless.definition';
import * as tabsGroupDef from './tabs-group.definition';
import * as layoutDef from './layout.definition';
import * as validGroupDef from './valid-group.definition';
import * as complexNestingDef from './complex-nesting.definition';
import * as complexArrayDef from './complex-array.definition';
import * as complexTupleDef from './complex-tuple.definition';
import * as complexRecordDef from './complex-record.definition';
import * as complexIntersectDef from './complex-intersect.definition';
import * as complexUnionDef from './complex-union.definition';
import * as recordBasicDef from './record-basic.definition';
import * as formUseLayoutDef from './form-use-layout.definition';
import * as formUseTabsGroupDef from './form-use-tabs-group.definition';
import * as formUseValidGroupDef from './form-use-valid-group.definition';
import * as formUseFilterGroupDef from './form-use-filter-group.definition';
import * as formUseScrollGroupDef from './form-use-scroll-group.definition';
import * as recordLabelDef from './record-label.definition';
import * as recordConfigDef from './record-config.definition';
import * as recordTranslationDef from './record-translation.definition';
import * as recordGroupKeyValueDef from './record-group-key-value.definition';
import * as recordValidationDef from './record-validation.definition';
import * as recordCompleteDef from './record-complete.definition';
import * as basicFormConfigDef from './basic-form-config.definition';
import * as basicDefaultValueDef from './basic-default-value.definition';
import * as basicDefaultValueFormDef from './basic-default-value-form.definition';
import * as basicNullableDef from './basic-nullable.definition';
import * as basicRequiredDef from './basic-required.definition';
import * as basicRequiredOverrideDef from './basic-required-override.definition';
import * as basicDisabledDef from './basic-disabled.definition';
import * as basicValidatorDef from './basic-validator.definition';
import * as transformDemoDef from './transform-demo.definition';
import * as transformToModelDef from './transform-to-model.definition';
import * as transformToViewDef from './transform-to-view.definition';
import * as transformPipeDef from './transform-pipe.definition';
import * as transformBasicDef from './transform-basic.definition';
import * as transformFlattenDef from './transform-flatten.definition';
import * as transformArrayDef from './transform-array.definition';
import * as dynamicHideWhenDef from './dynamic-hide-when.definition';
import * as dynamicHideDisabledDef from './dynamic-hide-disabled.definition';
import * as dynamicDisableWhenDef from './dynamic-disable-when.definition';
import * as dynamicValueChangeDef from './dynamic-value-change.definition';
import * as dynamicPaymentDef from './dynamic-payment.definition';
import * as dynamicSubmittedDef from './dynamic-submitted.definition';
import * as dynamicCascadeDef from './dynamic-cascade.definition';
import * as dynamicUpdateOtherDef from './dynamic-update-other.definition';
import * as arrayResetDef from './array-reset.definition';
import * as arrayShrinkDef from './array-shrink.definition';
import * as arrayMarkDef from './array-mark.definition';
import * as arrayEmptyValueDef from './array-empty-value.definition';
import * as arrayTupleDef from './array-tuple.definition';
import * as arrayTupleWithRestDef from './array-tuple-with-rest.definition';
import * as arrayCompleteDef from './array-complete.definition';
import * as validationDemoDef from './validation-demo.definition';
import * as validationSyncDef from './validation-sync.definition';
import * as validationAsyncDef from './validation-async.definition';
import * as validationCombinedDef from './validation-combined.definition';
import * as validationCompareDef from './validation-compare.definition';
import * as validationConditionalDef from './validation-conditional.definition';
import * as validationDynamicErrorDef from './validation-dynamic-error.definition';
import * as complexCombinedDef from './complex-combined.definition';
import * as controlGroupDefaultDef from './control-group-default.definition';
import * as controlGroupAsControlDef from './control-group-as-control.definition';
import * as controlGroupAsVirtualDef from './control-group-as-virtual.definition';
import * as transformCompleteDef from './transform-complete.definition';
import * as formUseValueChangeDef from './form-use-value-change.definition';
import * as formUseDisableWhenDef from './form-use-disable-when.definition';
import * as formUseArrayRwDef from './form-use-array-rw.definition';
import * as formUseUpdateOtherDef from './form-use-update-other.definition';
import * as formUseValidatorDef from './form-use-validator.definition';
import * as formUseCascadeDef from './form-use-cascade.definition';
import * as basicFieldDisableWhenDef from './basic-field-disable-when.definition';
import * as arrayBasicDef from './array-basic.definition';
import * as basicFieldOverviewDef from './basic-field-overview.definition';
import * as completeExampleDef from './complete-example.definition';
import * as complexSchemaOverviewDef from './complex-schema-overview.definition';
import * as controlGroupIntersectVirtualDef from './control-group-intersect-virtual.definition';
import * as dynamicFieldsOverviewDef from './dynamic-fields-overview.definition';
import * as recordGroupOverviewDef from './record-group-overview.definition';

export interface DemoDefinition {
  schema: BaseSchema<any, any, any>;
  model?: unknown;
  options?: Record<string, any>;
}

export const demoRegistry: Record<string, DemoDefinition> = {
  string: typeStringDef,
  number: typeNumberDef,
  boolean: typeBooleanDef,
  picklist: typePicklistDef,
  object: typeObjectDef,
  looseObject: looseObjectDef,
  objectWithRest: objectWithRestDef,
  'object-group-default': objectGroupDefaultDef,
  'object-group-loose': objectGroupLooseDef,
  'object-group-strict': objectGroupStrictDef,
  'object-group-virtual-mode': objectGroupVirtualModeDef,
  'object-group-empty-value': objectGroupEmptyValueDef,
  record: recordDef,
  array: typeArrayDef,
  tuple: tupleDef,
  looseTuple: looseTupleDef,
  tupleWithRest: tupleWithRestDef,
  default: defaultValueDef,
  nested: nestedObjectDef,
  'component-use': componentUseDef,
  nfc: nfcDef,
  action: actionDef,
  events: eventsDef,
  'api-css-class': apiCssClassDef,
  'api-attributes': apiAttributesDef,
  context: contextDef,
  raw: rawDef,
  selectorless: selectorlessDef,
  'tabs-group': tabsGroupDef,
  layout: layoutDef,
  'valid-group': validGroupDef,
  'complex-nesting': complexNestingDef,
  'complex-array': complexArrayDef,
  'complex-tuple': complexTupleDef,
  'complex-record': complexRecordDef,
  'complex-intersect': complexIntersectDef,
  'complex-union': complexUnionDef,
  'record-basic': recordBasicDef,
  'form-use-layout': formUseLayoutDef,
  'form-use-tabs-group': formUseTabsGroupDef,
  'form-use-valid-group': formUseValidGroupDef,
  'form-use-filter-group': formUseFilterGroupDef,
  'form-use-scroll-group': formUseScrollGroupDef,
  'record-label': recordLabelDef,
  'record-config': recordConfigDef,
  'record-translation': recordTranslationDef,
  'record-group-key-value': recordGroupKeyValueDef,
  'record-validation': recordValidationDef,
  'record-complete': recordCompleteDef,
  'basic-form-config': basicFormConfigDef,
  'basic-default-value': basicDefaultValueDef,
  'basic-default-value-form': basicDefaultValueFormDef,
  'basic-nullable': basicNullableDef,
  'basic-required': basicRequiredDef,
  'basic-required-override': basicRequiredOverrideDef,
  'basic-disabled': basicDisabledDef,
  'basic-validator': basicValidatorDef,
  'transform-demo': transformDemoDef,
  'transform-to-model': transformToModelDef,
  'transform-to-view': transformToViewDef,
  'transform-pipe': transformPipeDef,
  'transform-basic': transformBasicDef,
  'transform-flatten': transformFlattenDef,
  'transform-array': transformArrayDef,
  'dynamic-hide-when': dynamicHideWhenDef,
  'dynamic-hide-disabled': dynamicHideDisabledDef,
  'dynamic-disable-when': dynamicDisableWhenDef,
  'dynamic-value-change': dynamicValueChangeDef,
  'dynamic-payment': dynamicPaymentDef,
  'dynamic-submitted': dynamicSubmittedDef,
  'dynamic-cascade': dynamicCascadeDef,
  'dynamic-update-other': dynamicUpdateOtherDef,
  'array-reset': arrayResetDef,
  'array-shrink': arrayShrinkDef,
  'array-mark': arrayMarkDef,
  'array-empty-value': arrayEmptyValueDef,
  'array-tuple': arrayTupleDef,
  'array-tuple-with-rest': arrayTupleWithRestDef,
  'array-complete': arrayCompleteDef,
  'validation-demo': validationDemoDef,
  'validation-sync': validationSyncDef,
  'validation-async': validationAsyncDef,
  'validation-combined': validationCombinedDef,
  'validation-compare': validationCompareDef,
  'validation-conditional': validationConditionalDef,
  'validation-dynamic-error': validationDynamicErrorDef,
  'complex-combined': complexCombinedDef,
  'control-group-default': controlGroupDefaultDef,
  'control-group-as-control': controlGroupAsControlDef,
  'control-group-as-virtual': controlGroupAsVirtualDef,
  'transform-complete': transformCompleteDef,
  'form-use-value-change': formUseValueChangeDef,
  'form-use-disable-when': formUseDisableWhenDef,
  'form-use-array-rw': formUseArrayRwDef,
  'form-use-update-other': formUseUpdateOtherDef,
  'form-use-validator': formUseValidatorDef,
  'form-use-cascade': formUseCascadeDef,
  'basic-field-disable-when': basicFieldDisableWhenDef,
  'array-basic': arrayBasicDef,
  'basic-field-overview': basicFieldOverviewDef,
  'complete-example': completeExampleDef,
  'complex-schema-overview': complexSchemaOverviewDef,
  'control-group-intersect-virtual': controlGroupIntersectVirtualDef,
  'dynamic-fields-overview': dynamicFieldsOverviewDef,
  'record-group-overview': recordGroupOverviewDef,
};
