import { AbstractControl } from '../field/abstract_model';

export function controlStatusList(
  fieldControl?: AbstractControl,
  skipDisabled?: boolean,
) {
  if (!fieldControl) {
    return [];
  }
  const statusList = [];
  if (!skipDisabled && fieldControl.disabled$$()) {
    statusList.push('disabled');
  }
  if (fieldControl.touched$$()) {
    statusList.push('touched');
  } else {
    statusList.push('untouched');
  }
  if (fieldControl.dirty$$()) {
    statusList.push('dirty');
  } else {
    statusList.push('pristine');
  }
  switch (fieldControl.status$$()) {
    case 'VALID':
      statusList.push('valid');
      break;
    case 'INVALID':
      statusList.push('invalid');
      break;
    case 'PENDING':
      statusList.push('pending');
      break;
    default:
      break;
  }
  return statusList;
}

export function fieldControlStatusClass(
  fieldControl?: AbstractControl,
  skipDisabled?: boolean,
) {
  return controlStatusList(fieldControl, skipDisabled)
    .map((item) => `pi-${item}`)
    .join(' ');
}
