import type { ApplyResult, EntryState, EntryStates, StepState } from '@ez4/stateful';
import type { EveryType, SourceMap, TypeClass, TypeObject } from '@ez4/reflection';
import type { IdentityAccount, IdentityGrant } from './identity.js';
import type { ServiceMetadata, ExtraSource } from './service.js';
import type { MetadataResult } from './metadata.js';
import type { DeployOptions } from './deploy.js';

export type Trigger = SyncEvent | AsyncEvent;

export type SyncEventResult<T> = T | null;
export type AsyncEventResult<T> = SyncEventResult<T> | Promise<SyncEventResult<T>>;

export type SyncTriggerResult<T extends keyof SyncEvent> = ReturnType<SyncEvent[T]>;
export type AsyncTriggerResult<T extends keyof AsyncEvent> = ReturnType<AsyncEvent[T]>;

export type SyncEventTrigger<T extends keyof SyncEvent> = (
  handler: SyncEvent[T]
) => SyncTriggerResult<T>;

export type AsyncEventTrigger<T extends keyof AsyncEvent> = (
  handler: AsyncEvent[T]
) => AsyncTriggerResult<T>;

export type SyncEvent = {
  'reflection:loadFile': (file: string) => SyncEventResult<string>;
  'reflection:typeObject': (type: TypeObject) => SyncEventResult<EveryType>;
  'metadata:getServices': (reflection: SourceMap) => SyncEventResult<MetadataResult>;
  'metadata:getLinkedService': (type: TypeClass) => SyncEventResult<string>;
};

export type AsyncEvent = {
  'deploy:prepareLinkedService': (event: ServiceEvent) => AsyncEventResult<ExtraSource>;
  'deploy:prepareIdentityAccount': (event: IdentityEvent) => AsyncEventResult<IdentityAccount[]>;
  'deploy:prepareIdentityGrant': (event: IdentityEvent) => AsyncEventResult<IdentityGrant>;
  'deploy:prepareExecutionPolicy': (event: PolicyResourceEvent) => AsyncEventResult<EntryState>;
  'deploy:prepareExecutionRole': (event: RoleResourceEvent) => AsyncEventResult<EntryState>;
  'deploy:prepareResources': (event: PrepareResourceEvent) => AsyncEventResult<void>;
  'deploy:connectResources': (event: ConnectResourceEvent) => AsyncEventResult<void>;
  'deploy:plan': (event: DeployEvent) => AsyncEventResult<StepState[]>;
  'deploy:apply': (event: DeployEvent) => AsyncEventResult<ApplyResult>;
};

export type ServiceEvent = {
  service: ServiceMetadata;
  options: DeployOptions;
};

export type IdentityEvent = {
  options: DeployOptions;
};

export type PolicyResourceEvent = {
  state: EntryStates;
  options: DeployOptions;
};

export type RoleResourceEvent = {
  state: EntryStates;
  grants: IdentityGrant[];
  accounts: IdentityAccount[];
  policies: EntryState[];
  options: DeployOptions;
};

export type PrepareResourceEvent = {
  state: EntryStates;
  service: ServiceMetadata;
  options: DeployOptions;
  role: EntryState | null;
};

export type ConnectResourceEvent = {
  state: EntryStates;
  service: ServiceMetadata;
  options: DeployOptions;
};

export type DeployEvent = {
  newState: EntryStates;
  oldState: EntryStates;
};
