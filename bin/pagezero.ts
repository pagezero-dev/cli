#!/usr/bin/env bun

import { program } from "commander"

import { init } from "../src/commands/init"
import { upgrade } from "../src/commands/upgrade"

program.description("PageZERO CLI").option("-h, --help", "output usage information")

program.command("init").description("initialize a new project").action(init)

program
  .command("upgrade")
  .description("upgrade pagezero stack")
  .option("-y, --yes", "skip confirmation prompt")
  .action(upgrade)

try {
  await program.parseAsync()
} catch (error) {
  if (error instanceof Error && error.name === "ExitPromptError") {
    process.exit(130)
  }

  throw error
}
