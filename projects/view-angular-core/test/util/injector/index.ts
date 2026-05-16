import {
  ɵINJECTOR_SCOPE,
  provideZonelessChangeDetection,
  ɵisEnvironmentProviders,
  Injector,
  Provider,
  EnvironmentInjector,
} from '@angular/core';

export const createInjector = () => {
  const instance = Injector.create({
    providers: [
      { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
      ...(() => {
        const zone = provideZonelessChangeDetection();
        if (ɵisEnvironmentProviders(zone)) {
          return zone.ɵproviders as Provider[];
        }
        throw new Error('ɵproviders not found');
      })(),
      { provide: EnvironmentInjector, useFactory: () => instance },
    ],
  });
  return instance;
};
