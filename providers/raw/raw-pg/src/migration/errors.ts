export class MissingConnectionStringAtApplyError extends Error {
  constructor(
    public envName: string,
    public database: string
  ) {
    super(
      `Missing env var '${envName}' while applying migrations for database '${database}'. ` +
        `Set it in your deploy environment before running 'ez4 deploy'.`
    );
  }
}
