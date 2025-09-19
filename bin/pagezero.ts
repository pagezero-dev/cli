#!/usr/bin/env bun

import { input } from "@inquirer/prompts"
import { $ } from "bun"
import chalk from "chalk"
import { program } from "commander"
import ora from "ora"

program
  .description("PageZERO CLI")
  .option("-h, --help", "output usage information")

program.command("init").description("initialize a new project").action(init)

program.parse()

async function init() {
  // Welcome
  console.log(chalk.green("👋 Welcome to PageZERO CLI"))
  console.log(chalk.green("🚀 Let's get you started with your project!"))

  // Bootstrap the project
  const projectName = await input({
    message: "What is the name of your project?",
  })
  const creatingProjectSpinner = ora(`Bootstrapping ${projectName}...`).start()
  await $`bun create pagezero-app --no-install ${projectName}`.quiet()
  creatingProjectSpinner.succeed()

  // Install dependencies
  const installingDependenciesSpinner = ora(`Installing dependencies`).start()
  await $`cd ${projectName} && bun install`.quiet()
  installingDependenciesSpinner.succeed()

  // Run setup script
  const runningSetupScriptSpinner = ora(
    `Running setup script (bun run setup)`,
  ).start()
  await $`cd ${projectName} && bun run setup`.quiet()
  runningSetupScriptSpinner.succeed()

  // Done
  console.log(chalk.green("🎉 Done! Your project is ready to go."))
  console.log(chalk.green.bold(`cd ${projectName}`))
  console.log(chalk.green.bold("bun run dev"))
}
