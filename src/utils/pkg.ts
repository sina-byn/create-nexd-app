import fs from 'fs';

// * constants
const PACKAGE_PATH = 'package.json';

// * types
type PackageJson = { [k: string]: unknown };

export const loadPkgJson = (): PackageJson => {
  if (!fs.existsSync(PACKAGE_PATH)) throw new Error(`Could not find '${PACKAGE_PATH}'`);
  return JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf-8'));
};

export const savePkgJson = (pkg: PackageJson) => {
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2), 'utf-8');
};
