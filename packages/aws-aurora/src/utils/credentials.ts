import { randomBytes } from 'node:crypto';

export const getRandomPassword = () => {
  return `e${randomBytes(15).toString('hex')}`;
};
