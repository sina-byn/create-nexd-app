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

  process.exit(1);
});

const createApp = async () => {
  // * ora
  const ora = (await import('ora')).default;

  // * execa
  const { $ } = await import('execa');

  const { appName } = await prompts({
    type: 'text',
    name: 'appName',
    initial: 'nexd-project',
    message: 'Project name:',
  });

  const appDir = appName === '.' ? process.cwd() : path.join(process.cwd(), appName);

  const exists = fs.existsSync(appDir);
  if (!exists) fs.mkdirSync(appDir, { recursive: true });

  const isEmpty = exists ? fs.readdirSync(appDir).length === 0 : true;
  if (!isEmpty) throw new Error(`'${appDir}' is not an empty directory`);

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

  emitter.on('info', info => {
    const message = info.message[0].toUpperCase() + info.message.slice(1);
    spinner.succeed(pc.greenBright(message));
  });

  await emitter.clone(appDir);

  process.chdir(appDir);

  if (gitInit) await $({ stdio: 'inherit' })`git init`;

  if (npmInstall) {
    spinner.start(pc.blueBright('Installing dependencies...'));

    await $`npm i`;

    spinner.succeed(pc.greenBright('Dependencies installed successfully'));
  }
};

program.action(async () => await createApp());
