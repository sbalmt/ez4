import { arrayUnique } from '@ez4/utils';

export const getSanitizedHeader = (header: string) => {
  return header.trim().toLowerCase();
};

export const getSanitizedHeaders = (headers: string[]) => {
  return arrayUnique(headers.map((header) => getSanitizedHeader(header)));
};
