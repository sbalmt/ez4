import type { Bucket } from '@ez4/storage';
import type { ProviderContext } from '@ez4/emulator';

export const makeRemoteService = ({ content }: { content: string }) => {
  return () => ({
    read: async () => Buffer.from(content),
    stat: async () => ({ size: content.length, type: 'text/plain' })
  });
};

export const makeProbe = (_options: unknown, context: ProviderContext) => {
  return () => ({
    received: (event: Bucket.ObjectEvent) => context.request('received', event)
  });
};

export const receiveEvent = async (
  { eventType, bucketName, objectKey, objectSize }: Bucket.Incoming,
  context: { probe: { received: (event: Bucket.ObjectEvent) => Promise<unknown> } }
) => {
  await context.probe.received({ eventType, bucketName, objectKey, objectSize });
};
