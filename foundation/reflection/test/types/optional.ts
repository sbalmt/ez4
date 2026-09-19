export interface Optional {
  // Regular
  regular?: any;

  // Array
  requiredArray: undefined[];
  optionalArray?: undefined[];
  explicitOptionalArray?: undefined[] | undefined;
}
