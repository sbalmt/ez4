// @ts-expect-error: No parameters and no return type.
export declare function regular1();

export declare function regular2(): void;

// @ts-expect-error: Ignore no return.
export declare function regular3(param: any);

export declare function regular4(param1: any, param2: any): void;

export declare function regular5(param1: any, ...param2: any[]): void;

export function regular6(_param = null): void {}

export async function regular7(): Promise<void> {}

export declare function destructing1({ param1, param2 }: any): void;

export declare function destructing2({ param1, ...params }: any): void;

// @ts-expect-error: Ignore non used `_alias`.
export declare function destructing3({ param1, param2: _alias, ...params }: any): void;
