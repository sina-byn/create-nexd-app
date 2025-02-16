import fs from 'fs';

// * constants
const PACKAGE_PATH = 'package.json';

// * types
type PackageJson = { [k: string]: unknown };

export const loadPkgJson = () => {
  if (!fs.existsSync(PACKAGE_PATH)) throw new Error(`Could not find '${PACKAGE_PATH}'`);
  const pkg: PackageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf-8'));

  return {
    set: (key: keyof PackageJson, value: unknown) => (pkg[key] = value),
    save: () => fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2), 'utf-8'),
  };
};
