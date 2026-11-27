console.log('Custom entrypoint initialized.');

export const snsEventEntrypoint = async (...args: unknown[]) => {
  // @ts-expect-error EZ4 provides this virtual module during deployment bundling.
  const entrypoint = await import('ez4:entrypoint');

  return entrypoint.snsEventEntrypoint(...args);
};
