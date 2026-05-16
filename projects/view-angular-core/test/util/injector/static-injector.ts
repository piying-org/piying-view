import { ChangeDetectionScheduler, ChangeDetectionSchedulerImpl, createRootInjector } from 'static-injector';

export const createInjector =()=> createRootInjector({
  providers: [
    {
      provide: ChangeDetectionScheduler,
      useClass: ChangeDetectionSchedulerImpl,
    },
  ],
});
