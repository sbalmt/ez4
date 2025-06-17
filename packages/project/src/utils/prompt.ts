import { createInterface } from 'node:readline/promises';

export const waitConfirmation = async (question: string) => {
  const tty = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  const answer = await tty.question(`[EZ4]: ${question} (y/N): `);
  const result = answer.trim().toLowerCase() === 'y';

  tty.close();

  process.stdout.write('\n');

  return result;
};
