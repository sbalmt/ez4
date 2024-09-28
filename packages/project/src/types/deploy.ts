export type DeployOptions = {
  resourcePrefix: string;
  projectName: string;
  imports?: Record<string, DeployOptions>;
};
