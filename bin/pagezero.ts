#!/usr/bin/env bun

import { program } from "commander"
import logSymbols from "log-symbols"

import { init } from "../src/commands/init"
import { upgrade } from "../src/commands/upgrade"

const [major = 0, minor = 0] = Bun.version.split(".").map((part) => Number.parseInt(part, 10))
if (major < 1 || (major === 1 && minor < 4)) {
  console.error(
    `${logSymbols.error} Older Bun versions are not supported. Requires Bun 1.4 or later (current: ${Bun.version}).`,
  )
  process.exit(1)
}

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
