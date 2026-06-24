import { input } from "@inquirer/prompts"
import { $ } from "bun"
import chalk from "chalk"
import { spinner } from "../utils"

export async function init() {
  // Welcome
  console.log(chalk.green("👋 Welcome to PageZERO CLI"))
  console.log(chalk.green("🚀 Let's get you started with your project!"))

  // Bootstrap the project
  const projectName = await input({
    message: "What is the name of your project?",
  })
  await spinner("downloading pagezero", async () => {
    await $`git clone --depth 1 https://github.com/pagezero-dev/pagezero.git ${projectName}`.quiet()
  })

  // Install dependencies
  await spinner(`running: bun install`, () =>
    $`bun install`.quiet().cwd(projectName),
  )

  // Run setup script
  await spinner(`running: bun run setup`, () =>
    $`bun run setup`.quiet().cwd(projectName),
  )

  // Configure wrangler.json
  await spinner(`configuring wrangler.json`, async () =>
    $`bun run setup:wrangler`.quiet().cwd(projectName),
  )

  // Initialize git repository
  await spinner("initializing fresh git repository", async () => {
    await $`rm -rf .git`.quiet().cwd(projectName)
    await $`git init`.quiet().cwd(projectName)
    await $`git add .`.quiet().cwd(projectName)
    await $`git commit -m "Initial commit"`.quiet().cwd(projectName)
    await $`git branch -m master main`.quiet().cwd(projectName)
  })

  // Done
  console.log(chalk.green("🎉 Done! Your project is ready to go."))
  console.log(chalk.green.bold(`cd ${projectName}`))
  console.log(chalk.green.bold("bun dev"))
}
