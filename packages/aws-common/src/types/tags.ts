import { deepCompare } from '@ez4/utils';

export type ResourceTags = {
  [key: string]: string;
};

export type TagResource = (tags: ResourceTags) => Promise<void>;

export type UntagResource = (tagKeys: string[]) => Promise<void>;

/**
 * Get a list of tags following the expected AWS format.
 *
 * @param tags Input tags.
 * @returns Returns the list of tags following the expected AWS format.
 */
export const getTagList = (tags: ResourceTags) => {
  return Object.entries(tags).map(([Key, Value]) => ({ Key, Value }));
};

/**
 * Call the `tagResource` or `untagResource` methods based on the differences
 * between `target` and `source` tags.
 *
 * When a tag exists on `target` but not on `source`, this tag is created.
 * When a tag exists on `source` but not on `target`, this tag is removed.
 * When a tag exists on both, the one on `target` is applied.
 *
 * @param target Target tags.
 * @param source Source tags.
 * @param tagResource Callback to tag a resource.
 * @param untagResource Callback to untag a resource.
 */
export const applyTagUpdates = async (
  target: ResourceTags | undefined,
  source: ResourceTags | undefined,
  tagResource: TagResource,
  untagResource: UntagResource
) => {
  const changes = deepCompare(target ?? {}, source ?? {});

  if (changes.remove) {
    await untagResource(Object.keys(changes.remove));
  }

  if (changes.create || changes.update) {
    await tagResource({ ...changes.create, ...changes.update });
  }
};
