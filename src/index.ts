#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import degit from 'degit';
import pc from 'picocolors';
import prompts from 'prompts';

import { program } from 'commander';

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

  const emitter = degit('sina-byn/node-color-picker');

  await emitter.clone(appDir);
  spinner.succeed(pc.greenBright('Template cloned successfully'));

  process.chdir(appDir);

  if (gitInit) {
    spinner.start(pc.blueBright('Initializing Git repository...\n'));
    await $({ stdio: 'inherit' })`git init`;
    spinner.succeed(pc.greenBright('Git repository initialized'));
  }

  if (npmInstall) {
    spinner.start(pc.blueBright('Installing dependencies...'));
    await $`npm i`;
    spinner.succeed(pc.greenBright('Dependencies installed successfully'));
  }

  console.log(pc.greenBright('✅ Nexd app initialized successfully'));
};

program.action(async () => await createApp());
