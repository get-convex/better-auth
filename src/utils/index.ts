export const requireEnv = (name: string) => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
};
