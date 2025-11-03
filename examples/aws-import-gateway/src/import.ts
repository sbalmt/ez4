import type { Api } from 'hello-aws-gateway';
import type { Http } from '@ez4/gateway';

/**
 * Example of AWS API Gateway imported with EZ4.
 */
export declare class ImportedApi extends Http.Import<Api> {
  /**
   * Name of the imported project from `ez4.project.js`
   */
  project: 'hello-aws-gateway';
}
