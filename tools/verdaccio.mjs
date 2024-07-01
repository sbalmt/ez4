import { runServer } from 'verdaccio';

if (!import.meta.dirname) {
  console.error(`Something went wrong, ensure your node is v20+`);
  process.exit(1);
}

const server = await runServer({
  self_path: import.meta.dirname,
  storage: '.registry',
  publish: {
    allow_offline: true
  },
  uplinks: {
    npmjs: {
      url: 'https://registry.npmjs.org/',
      maxage: '60m'
    }
  },
  packages: {
    '@ez4/*': {
      publish: ['$all'],
      access: ['$all']
    },
    '**': {
      access: ['$all'],
      proxy: ['npmjs']
    }
  }
});

server.listen(4873, () => {
  console.log('Verdaccio is running...');
});
