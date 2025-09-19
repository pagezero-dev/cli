#!/usr/bin/env bun

import { input } from "@inquirer/prompts"
import chalk from "chalk"
import { program } from "commander"
import ora from "ora"

program
  .description("PageZERO CLI")
  .option("-h, --help", "output usage information")

program
  .command("init")
  .description("initialize a new project")
  .action(async () => {
    console.log(chalk.green("👋 Welcome to PageZERO CLI"))
    console.log(chalk.green("🚀 Let's get you started with your project!"))
    const projectName = await input({
      message: "What is the name of your project?",
    })
    const spinner = ora(`Creating project ${projectName}...`).start()
    setTimeout(() => {
      spinner.suffixText = " done"
      spinner.succeed()
    }, 2000)
  })

program.parse()
