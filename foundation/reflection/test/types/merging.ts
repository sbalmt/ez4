/**
 * Declaration merging between two interfaces.
 */
export interface Settings {
  first: string;
}

export interface Settings {
  second: number;
}

/**
 * Declaration merging between a class and an interface, as `URL` and `URLSearchParams` in `@types/node`.
 */
export class Address {
  host!: string;
}

export interface Address {
  port: number;
}
