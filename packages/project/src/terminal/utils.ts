export const checkMinNodeVersion = () => {
  const [major, minor] = process.versions.node.split('.', 3).map((version) => {
    return parseInt(version, 10);
  });

  if (major < 20 && minor < 15) {
    console.log('Node v20.15+ is required.');
    process.exit(1);
  }
};

export const suppressNodeWarning = () => {
  const processEmit = process.emit;

  process.emit = (...args: any[]): any => {
    const [event, data] = args;

    if (event !== 'warning' || typeof data !== `object` || data.name !== 'ExperimentalWarning') {
      return processEmit.apply(process, [event, data]);
    }

    return false;
  };
};
