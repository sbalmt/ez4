# EZ4: Local ElasticMQ

ElasticMQ-backed local queue emulator for EZ4.

## Getting started

Install this package together with `@ez4/local-queue` when local queues need SQS-compatible interoperability.

## Configuration

```js
export default {
  localOptions: {
    queue: {
      host: 'localhost',
      port: 9324
    }
  }
}
```

Without this package, `@ez4/local-queue` keeps using the in-memory emulator.

## License

MIT License
