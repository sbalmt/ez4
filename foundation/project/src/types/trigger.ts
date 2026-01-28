import type { ApplyResult, EntryState, EntryStates, StepState } from '@ez4/stateful';
import type { EveryType, ReflectionTypes, TypeClass, TypeObject } from '@ez4/reflection';
import type { ServiceEmulator, EmulateServiceEvent, EmulateClientEvent, EmulatorRequestEvent, EmulatorResponse } from '../emulator/types';
import type { GenerateHelpEvent, GenerateResourceEvent } from '../generator/events';
import type { ResourceOutput, ResourceOutputEvent } from '../deploy/output';
import type { GeneratorUsageHelp } from '../generator/help';
import type { IdentityAccount, IdentityGrant } from './identity';
import type { DeployOptions, DestroyOptions, ServeOptions } from './options';
import type { ServiceMetadata, ContextSource } from './service';
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
  'metadata:getServices': (reflection: ReflectionTypes) => SyncEventResult<MetadataServiceResult>;
  'metadata:getLinkedService': (type: TypeClass) => SyncEventResult<string>;
  'generator:getUsageHelp': (event: GenerateHelpEvent) => SyncEventResult<GeneratorUsageHelp>;
  'deploy:resourceOutput': (event: ResourceOutputEvent) => SyncEventResult<ResourceOutput>;
};

export type AsyncEvent = {
  'generator:createResource': (event: GenerateResourceEvent) => AsyncEventResult<boolean>;
  'emulator:getClient': (event: EmulateClientEvent) => AsyncEventResult<unknown>;
  'emulator:getServices': (event: EmulateServiceEvent) => AsyncEventResult<ServiceEmulator>;
  'emulator:startService': (event: EmulateServiceEvent) => AsyncEventResult<void>;
  'emulator:resetService': (event: EmulateServiceEvent) => AsyncEventResult<void>;
  'emulator:stopService': (event: EmulateServiceEvent) => AsyncEventResult<void>;
  'emulator:fallbackRequest': (event: EmulatorFallbackRequestEvent) => AsyncEventResult<EmulatorResponse>;
  'deploy:prepareLinkedService': (event: ServiceEvent) => AsyncEventResult<ContextSource>;
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
  setServiceState: (state: EntryState, service: ServiceMetadata | string, options: DeployOptions) => void;
  tryGetServiceState: (service: ServiceMetadata | string, options: DeployOptions) => EntryState;
  getServiceState: (service: ServiceMetadata | string, options: DeployOptions) => EntryState;
  getDependencyFiles: (fileName: string) => string[];
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

export type EmulatorFallbackRequestEvent = {
  request: EmulatorRequestEvent;
  service: ServiceMetadata;
  options: ServeOptions;
};

export type DeployEvent = {
  newState: EntryStates;
  oldState: EntryStates;
  concurrency?: number;
  force?: boolean;
};

export type StateEvent = {
  options: DestroyOptions;
  contents?: string;
  path: string;
};
