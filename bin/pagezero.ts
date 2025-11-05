#!/usr/bin/env bun

import { program } from "commander"
import { init } from "../src/commands/init"
import { upgrade } from "../src/commands/upgrade"

program
  .description("PageZERO CLI")
  .option("-h, --help", "output usage information")

program
  .command("init")
  .description("initialize a new project")
  .option("-p, --powerup", "use PowerUP edition")
  .action(init)

program
  .command("upgrade")
  .description("upgrade pagezero stack")
  .option("-p, --powerup", "use PowerUP edition")
  .action(upgrade)

program.parse()
