export class MissingConnectionStringError extends Error {
  constructor(
    public envName: string,
    public serviceName: string
  ) {
    super(
      `Raw-pg database service '${serviceName}' requires env var '${envName}' at deploy time. ` +
        `Set it to your Postgres connection string (e.g. Supabase URL).`
    );
  }
}
