import * as v from 'valibot';
import { hideWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

export const schema = v.object({
  paymentMethod: v.picklist(['alipay', 'wechat', 'card']),
  alipayAccount: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'paymentMethod']] }).pipe(
          map((item) => item.list[0] !== 'alipay'),
        ),
    }),
  ),
  wechatAccount: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'paymentMethod']] }).pipe(
          map((item) => item.list[0] !== 'wechat'),
        ),
    }),
  ),
  cardNumber: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'paymentMethod']] }).pipe(
          map((item) => item.list[0] !== 'card'),
        ),
    }),
  ),
});

export const model = {
  paymentMethod: 'alipay',
  alipayAccount: '',
  wechatAccount: '',
  cardNumber: '',
};
