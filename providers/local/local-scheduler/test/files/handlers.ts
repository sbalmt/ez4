import type { AnyObject } from '@ez4/utils';

const getErrorData = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.constructor.name,
      message: error.message
    };
  }

  return error;
};

/**
 * Handler to test the event creation and retrieval.
 */
export const createAndGet = async ({ event }: AnyObject, { scheduler }: AnyObject) => {
  await scheduler.createEvent('event-1', {
    date: new Date(Date.now() + 60_000),
    event
  });

  const result = await scheduler.getEvent('event-1');

  return {
    isDate: result.date instanceof Date,
    event: result.event
  };
};

/**
 * Handler to test the event deletion.
 */
export const deleteTwice = async (_request: AnyObject, { scheduler }: AnyObject) => {
  await scheduler.createEvent('event-2', {
    date: new Date(Date.now() + 60_000),
    event: {
      foo: 'foo'
    }
  });

  return [await scheduler.deleteEvent('event-2'), await scheduler.deleteEvent('event-2')];
};

/**
 * Handler to test the event not found error.
 */
export const updateMissing = async (_request: AnyObject, { scheduler }: AnyObject) => {
  try {
    await scheduler.updateEvent('missing', {
      event: {
        foo: 'bar'
      }
    });
  } catch (error) {
    return getErrorData(error);
  }

  return undefined;
};

/**
 * Handler to test the event too old error.
 */
export const createTooOld = async (_request: AnyObject, { scheduler }: AnyObject) => {
  try {
    await scheduler.createEvent('event-3', {
      date: new Date(Date.now() - 60_000),
      event: {
        foo: 'foo'
      }
    });
  } catch (error) {
    return getErrorData(error);
  }

  return undefined;
};

/**
 * Handler to test the scheduler event processing.
 */
export const processEvent = async ({ event }: AnyObject, { scheduler }: AnyObject) => {
  await scheduler.createEvent('processed', {
    date: new Date(Date.now() + 60_000),
    event
  });
};
