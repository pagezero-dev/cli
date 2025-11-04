import { input } from "@inquirer/prompts"
import { $, file, write } from "bun"
import chalk from "chalk"
import { log } from "../utils"

export async function init() {
  // Welcome
  console.log(chalk.green("👋 Welcome to PageZERO CLI"))
  console.log(chalk.green("🚀 Let's get you started with your project!"))

  // Bootstrap the project
  const projectName = await input({
    message: "What is the name of your project?",
  })
  await log(
    `Running: bun create pagezero-dev/pagezero --no-install ${projectName}`,
    () =>
      $`bun create pagezero-dev/pagezero --no-install ${projectName}`.quiet(),
  )

  // Install dependencies
  await log(`Running: bun install`, () =>
    $`bun install`.quiet().cwd(projectName),
  )

  // Run setup script
  await log(`Running: bun run setup`, () =>
    $`bun run setup`.quiet().cwd(projectName),
  )

  // Update wrangler.json
  try {
    await log(`Updating wrangler.json`, async () => {
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
    })
  } catch (error) {
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
