export const checkMinNodeVersion = () => {
  const [major, minor] = process.versions.node.split('.', 3).map((version) => {
    return parseInt(version, 10);
  });

  if (major < 22 || (major === 22 && minor < 7)) {
    console.error('❌ Node v22.7+ is required.');
    process.exit(1);
  }
};
