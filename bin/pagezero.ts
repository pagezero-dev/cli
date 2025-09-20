#!/usr/bin/env bun

import { confirm, input } from "@inquirer/prompts"
import boxen from "boxen"
import { $, file, write } from "bun"
import chalk from "chalk"
import { program } from "commander"
import logSymbols from "log-symbols"
import ora from "ora"

program
  .description("PageZERO CLI")
  .option("-h, --help", "output usage information")

program.command("init").description("initialize a new project").action(init)

program.command("upgrade").description("upgrade pagezero stack").action(upgrade)

program.parse()

async function init() {
  // Welcome
  console.log(chalk.green("👋 Welcome to PageZERO CLI"))
  console.log(chalk.green("🚀 Let's get you started with your project!"))

  // Bootstrap the project
  const projectName = await input({
    message: "What is the name of your project?",
  })
  const creatingProjectSpinner = ora(
    `Running: bun create pagezero-dev/pagezero --no-install ${projectName}`,
  ).start()
  await $`bun create pagezero-dev/pagezero --no-install ${projectName}`.quiet()
  creatingProjectSpinner.succeed()

  // Install dependencies
  const installingDependenciesSpinner = ora(`Running: bun install`).start()
  await $`bun install`.quiet().cwd(projectName)
  installingDependenciesSpinner.succeed()

  // Run setup script
  const runningSetupScriptSpinner = ora(`Running: bun run setup`).start()
  await $`bun run setup`.quiet().cwd(projectName)
  runningSetupScriptSpinner.succeed()

  // Update wrangler.json
  const updatingWranglerJsonSpinner = ora(`Updating wrangler.json`).start()
  try {
    const wranglerJson = await file(`${projectName}/wrangler.json`).json()
    wranglerJson.name = projectName
    wranglerJson.d1_databases[0].database_name = `${projectName}-development`
    wranglerJson.env.production.d1_databases[0].database_name = `${projectName}-production`
    wranglerJson.env.preview.d1_databases[0].database_name = `${projectName}-preview`
    wranglerJson.env.test.d1_databases[0].database_name = `${projectName}-test`
    wranglerJson.env.production.d1_databases[0].database_id = "<DATABASE_ID>"
    wranglerJson.env.preview.d1_databases[0].database_id = "<DATABASE_ID>"
    await write(
      `${projectName}/wrangler.json`,
      JSON.stringify(wranglerJson, null, 2),
    )
    updatingWranglerJsonSpinner.succeed()
  } catch (error) {
    updatingWranglerJsonSpinner.warn()
    console.error(chalk.yellow("Issue with updating wrangler.json"))
    if (error instanceof Error) {
      console.error(chalk.yellow(error.message))
    }
  }

  // Done
  console.log(chalk.green("🎉 Done! Your project is ready to go."))
  console.log(chalk.green.bold(`cd ${projectName}`))
  console.log(chalk.green.bold("bun run dev"))
}

async function upgrade() {
  console.log(
    chalk.yellow(
      boxen(
        "Ugrade command is primitive. It will overwrite your existing \nproject files with the latest version of the PageZERO stack. \nAfterwards please review the changes through a git diff.",
        { padding: 1, title: "WARNING", titleAlignment: "center" },
      ),
    ),
  )

  const shouldProceed = await confirm({
    message: "Do you want to proceed?",
  })

  if (!shouldProceed) {
    return
  }

  const rsync = await $`command -v rsync`.quiet()
  if (rsync.stdout) {
    console.log(`${logSymbols.success} rsync is installed`)
  } else {
    console.log(
      `${logSymbols.error} rsync is not installed and is required for the upgrade command: please install it and try again`,
    )
    return
  }

  const wranglerFile = file(`wrangler.json`)
  if (await wranglerFile.exists()) {
    console.log(`${logSymbols.success} wrangler.json file found`)
  } else {
    console.log(
      `${logSymbols.error} wrangler.json file not found: please run command within PageZERO project directory`,
    )
    return
  }

  const clonePagezeroSpinner = ora(`downloading latest PageZERO stack`).start()
  await $`git clone --depth 1 https://github.com/pagezero-dev/pagezero.git pagezero-latest`.quiet()
  clonePagezeroSpinner.succeed()

  const copyPagezeroSpinner = ora(
    `copying PageZERO stack to project directory`,
  ).start()
  await $`rsync -a --exclude=".git" ./pagezero-latest/ ./`.quiet()
  copyPagezeroSpinner.succeed()

  const cleanupSpinner = ora(`cleaning up`).start()
  await $`rm -rf pagezero-latest`.quiet()
  cleanupSpinner.succeed()

  console.log(chalk.green("PageZERO stack upgraded successfully"))
  console.log(chalk.green.bold("Please review the changes through a git diff"))
}
