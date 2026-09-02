# EZ4: Deployment Overview

EZ4 deployments are designed to be straightforward: define your project, run the deployment command, review the changes, confirm the plan, and let EZ4 apply the infrastructure updates.

## Deploying a project

The usual deployment flow is:

```sh
npx ez4 deploy
```

If you use a project script, it is typically defined like this:

```json
{
  "scripts": {
    "deploy": "tsc && ez4 deploy"
  }
}
```

This command will build the project, resolve the declared infrastructure, compare it with the last deployed state, and apply the required changes.

## What happens during deployment

EZ4 follows a predictable deployment lifecycle:

1. It reads the project configuration and deployment settings.
2. It resolves the resources declared in your application.
3. It compares the current desired state with the last saved deployment state.
4. It shows which resources will be created, updated, replaced, or removed.
5. It asks for confirmation before continuing.
6. It applies the required changes and saves the new deployment state.

This keeps deployments explicit and reviewable before any infrastructure is modified.

## Reviewing step

Before the actual update begins, EZ4 prints a clear summary of the resource changes. This gives you a chance to confirm that the deployment matches your intent.

Examples of planned actions include:

- Create new resources.
- Update existing configuration.
- Replace resources when necessary.
- Delete resources that are no longer part of the project.

If there are no meaningful changes, EZ4 will stop early and report that there are no updates to apply.

## Confirmation step

Deployments are intentionally safe by default. If the project is configured to require confirmation (which is the default behavior), EZ4 pauses and asks for approval before continuing.

This helps prevent accidental infrastructure changes when a project is being updated from a branch, local environment, or shared configuration.

## Deployment step

Once the deployment is confirmed, EZ4 executes the update. It applies the approved resource changes and saves the resulting deployment state so the project reflects the latest configuration.

This is the execution step that carries out the plan. It is followed by the rollout, which promotes the latest ready version so traffic is routed to the updated implementation.

## Rollout step

After the deployment is applied, EZ4 executes the rollout. When a resource changes, EZ4 prepares the updated version of the service and promotes the active release so traffic is routed to the new implementation.

This rollout is done as a controlled update rather than an all-at-once switch. Once the replacement is ready, EZ4 can clean up older published versions that are no longer needed. This keeps the deployment predictable while making the updated version available as soon as the rollout completes.

## Deployment safety

EZ4 includes safeguards to keep deploys controlled:

- It checks the deployment plan before applying changes.
- It can require manual confirmation.
- It can force a deploy when needed with the `--force` flag.
- It preserves the last known deployment state so future deploys can be compared incrementally.

These checks reduce the chance of accidentally changing resources that were not meant to be touched.

## Useful deployment flags

Common deployment flags include:

- `--force`: Apply the deployment even when the plan appears to be unchanged.
- `--debug`: Show more detailed logs during the deployment process.
- `--branch`: Target a different deployment branch name.
- `--environment`: Load environment-specific values for the deploy.

## Summary

Deployment in EZ4 is built around a simple idea: your TypeScript project is the source of truth, and the deployment command turns that model into infrastructure changes safely and predictably.

The process is intentionally transparent: you review the plan, confirm the changes, apply the update, and then let EZ4 complete the rollout.

## What's next

- [Quick start](./quick-start.md)
- [Configuration](./configuration.md)
- [Contracts overview](./contracts.md)
- [Architecture overview](./architecture.md)
- [Philosophy](./philosophy.md)

## License

MIT License
