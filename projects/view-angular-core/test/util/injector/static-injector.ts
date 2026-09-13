import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createRootInjector,
  EffectScheduler,
  Injector,
} from 'static-injector';

export const createInjector = () =>
  createRootInjector({
    providers: [
      {
        provide: ChangeDetectionScheduler,
        useClass: ChangeDetectionSchedulerImpl,
      },
    ],
  });

export const flushEffects = (injector: Injector) =>
  injector.get(EffectScheduler).flush();
