export { inject as Inject, injectable as Injectable } from 'inversify';
export { useService } from './hooks/use-service';
export { OnActivate } from './life-cycle-hooks/on-activate';
export { OnDeactivate } from './life-cycle-hooks/on-deactivate';
export { createStatefulServiceHookAlias } from './utils/create-stateful-service-hook-alias';
export { ServiceContainer } from './service-container';
export { StatefulService } from './stateful-service';
