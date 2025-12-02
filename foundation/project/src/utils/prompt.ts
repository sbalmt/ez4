import { createInterface } from 'node:readline/promises';

export const waitConfirmation = async (question: string) => {
  const tty = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  const answer = await tty.question(`⁉️  ${question} (y/N): `);
  const result = answer.trim().toLowerCase() === 'y';

  tty.close();

  return result;
};
