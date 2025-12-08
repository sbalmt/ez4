/**
 * Json body payload.
 */
export interface WebJsonBody {}

/**
 * Raw body payload.
 */
export type WebRawBody = string;

/**
 * Body payload.
 */
export type WebBody = WebJsonBody | WebRawBody;
