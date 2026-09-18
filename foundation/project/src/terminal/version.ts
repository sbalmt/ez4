export const checkMinNodeVersion = () => {
  const [major, minor] = process.versions.node.split('.', 2).map((version) => {
    return parseInt(version, 10);
  });

  if (major < 24 || (major === 24 && minor < 21)) {
    console.error('❌ Node v24.21+ is required.');
    process.exit(1);
  }
};
