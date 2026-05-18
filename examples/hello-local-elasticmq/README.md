# Hello: Local ElasticMQ

This example showcases how to use ElasticMQ-backed local queue emulation.

## Getting started

Create a `local.env` following the contents of `example.env` file.

#### Install

```sh
npm install
```

#### Run locally

Start ElasticMQ:

```sh
docker compose up -d elasticmq
```

Run the example:

```sh
npm run serve
```

Run tests:

```sh
npm run test
```

## License

MIT License
