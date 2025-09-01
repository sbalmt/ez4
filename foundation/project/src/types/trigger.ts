import type { ApplyResult, EntryState, EntryStates, StepState } from '@ez4/stateful';
import type { EveryType, SourceMap, TypeClass, TypeObject } from '@ez4/reflection';
import type { EmulatorService, EmulateServiceEvent, EmulateClientEvent } from './emulator';
import type { IdentityAccount, IdentityGrant } from './identity';
import type { DeployOptions, DestroyOptions } from './options';
import type { ServiceMetadata, ExtraSource } from './service';
import type { MetadataServiceResult } from './metadata';

export type Trigger = SyncEvent | AsyncEvent;

export type SyncEventResult<T> = T | null | undefined;
export type AsyncEventResult<T> = SyncEventResult<T> | Promise<SyncEventResult<T>>;

export type SyncTriggerResult<T extends keyof SyncEvent> = ReturnType<SyncEvent[T]>;
export type AsyncTriggerResult<T extends keyof AsyncEvent> = ReturnType<AsyncEvent[T]>;

export type SyncEventTrigger<T extends keyof SyncEvent> = (handler: SyncEvent[T]) => SyncTriggerResult<T>;

export type AsyncEventTrigger<T extends keyof AsyncEvent> = (handler: AsyncEvent[T]) => AsyncTriggerResult<T>;

export type SyncEvent = {
  'reflection:loadFile': (file: string) => SyncEventResult<string>;
  'reflection:typeObject': (type: TypeObject) => SyncEventResult<EveryType>;
  'metadata:getServices': (reflection: SourceMap) => SyncEventResult<MetadataServiceResult>;
  'metadata:getLinkedService': (type: TypeClass) => SyncEventResult<string>;
};

export type AsyncEvent = {
  'emulator:getClient': (event: EmulateClientEvent) => AsyncEventResult<unknown>;
  'emulator:getServices': (event: EmulateServiceEvent) => AsyncEventResult<EmulatorService>;
  'deploy:prepareLinkedService': (event: ServiceEvent) => AsyncEventResult<ExtraSource>;
  'deploy:prepareIdentityAccount': (event: IdentityEvent) => AsyncEventResult<IdentityAccount[]>;
  'deploy:prepareIdentityGrant': (event: IdentityEvent) => AsyncEventResult<IdentityGrant>;
  'deploy:prepareExecutionPolicy': (event: PolicyResourceEvent) => AsyncEventResult<EntryState>;
  'deploy:prepareExecutionRole': (event: RoleResourceEvent) => AsyncEventResult<EntryState>;
  'deploy:prepareResources': (event: PrepareResourceEvent) => AsyncEventResult<boolean>;
  'deploy:connectResources': (event: ConnectResourceEvent) => AsyncEventResult<void>;
  'deploy:plan': (event: DeployEvent) => AsyncEventResult<StepState[]>;
  'deploy:apply': (event: DeployEvent) => AsyncEventResult<ApplyResult>;
  'state:load': (event: StateEvent) => AsyncEventResult<Buffer>;
  'state:save': (event: StateEvent) => AsyncEventResult<void>;
};

export type EventContext = {
  role: EntryState | null;
  getServiceState: (service: ServiceMetadata | string, options: DeployOptions) => EntryState;
  setServiceState: (state: EntryState, service: ServiceMetadata | string, options: DeployOptions) => void;
  getDependencies: (fileName: string) => string[];
};

export type ServiceEvent = {
  service: ServiceMetadata;
  options: DeployOptions;
  context: EventContext;
};

export type IdentityEvent = {
  serviceType: string;
  options: DeployOptions;
};

export type PolicyResourceEvent = {
  state: EntryStates;
  serviceType: string;
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
  context: EventContext;
};

export type ConnectResourceEvent = {
  state: EntryStates;
  service: ServiceMetadata;
  options: DeployOptions;
  context: EventContext;
};

export type DeployEvent = {
  newState: EntryStates;
  oldState: EntryStates;
  force?: boolean;
};

export type StateEvent = {
  options: DestroyOptions;
  contents?: string;
  path: string;
};
