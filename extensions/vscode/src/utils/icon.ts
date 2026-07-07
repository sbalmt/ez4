const RESOURCE_ICONS: Record<string, string> = {
  Database: 'database',
  Gateway: 'globe',
  Scheduler: 'clock',
  Topic: 'broadcast',
  Storage: 'folder'
};

export const getResourceIcon = (resourceType: string) => {
  return RESOURCE_ICONS[resourceType];
};
