export type StateOptions = {
  resourcePrefix: string;
  projectName: string;
};

export type DeployOptions = StateOptions & {
  imports?: Record<string, DeployOptions>;
  debug?: boolean;
};
