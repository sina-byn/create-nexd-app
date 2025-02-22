#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import degit from 'degit';
import pc from 'picocolors';
import prompts from 'prompts';

import { program } from 'commander';

// * utils
import { savePkgJson, loadPkgJson } from './utils/pkg';

// ! template feature will be later implemented

process.on('uncaughtException', (err: Error) => {
  const errMessage = err.stack ?? `${err.name}: ${err.message}`;
  console.error(pc.redBright('\n' + errMessage));
  console.error(pc.redBright('❌ Failed initializing Nexd app'));

  process.exit(1);
});

const createApp = async () => {
  const ora = (await import('ora')).default;
  const { $ } = await import('execa');

  const { appName } = await prompts({
    type: 'text',
    name: 'appName',
    initial: 'nexd-project',
    message: 'Project name:',
  });

  const appDir = appName === '.' ? process.cwd() : path.join(process.cwd(), appName);

  if (fs.existsSync(appDir) && fs.readdirSync(appDir).length > 0) {
    throw new Error(`'${appDir}' is not an empty directory`);
  }

  fs.mkdirSync(appDir, { recursive: true });

  const { gitInit, npmInstall } = await prompts([
    {
      type: 'confirm',
      name: 'gitInit',
      message: 'Initialize a git repository',
    },
    {
      type: 'confirm',
      name: 'npmInstall',
      message: 'Install dependencies',
    },
  ]);

  const spinner = ora({ color: 'blue' }).start(pc.blueBright('Cloning nexd starter template...'));

  const emitter = degit('sina-byn/nexd');

  await emitter.clone(appDir);
  spinner.succeed(pc.greenBright('Template cloned successfully'));

  process.chdir(appDir);

  if (gitInit) {
    spinner.start(pc.blueBright('Initializing Git repository...'));
    await $`git init`;
    spinner.succeed(pc.greenBright('Git repository initialized'));
  }

  if (npmInstall) {
    spinner.start(pc.blueBright('Installing dependencies...'));
    await $`npm i`;
    spinner.succeed(pc.greenBright('Dependencies installed successfully'));
  }

  const pkg = {
    ...loadPkgJson(),
    name: appName,
    version: '0.0.0',
    repository: 'github:',
    description: '',
    author: ' <> ()',
    homepage: '',
    bugs: { url: '', email: '' },
    keywords: [],
  };

  savePkgJson(pkg);

  console.log(pc.greenBright('✅ Nexd app initialized successfully'));

  if (appName !== '.') console.log(pc.blueBright(`📂 Run: cd ${appName}`));
  console.log(pc.yellowBright('🚀 Start with: npm run nexd'));

  process.exit();
};

program.action(async () => await createApp());

program.parse(process.argv);
