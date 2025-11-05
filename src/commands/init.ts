import { input } from "@inquirer/prompts"
import { $, file, write } from "bun"
import chalk from "chalk"
import { spinner } from "../utils"

export async function init({ powerup }: { powerup?: boolean }) {
  // Welcome
  console.log(chalk.green("👋 Welcome to PageZERO CLI"))
  console.log(chalk.green("🚀 Let's get you started with your project!"))

  // Bootstrap the project
  const projectName = await input({
    message: "What is the name of your project?",
  })
  if (powerup) {
    await spinner("downloading pagezero powerup edition", async () => {
      await $`git clone --depth 1 https://github.com/pagezero-dev/powerup.git ${projectName}`.quiet()
    })
  } else {
    await spinner("downloading pagezero", async () => {
      await $`git clone --depth 1 https://github.com/pagezero-dev/pagezero.git ${projectName}`.quiet()
    })
  }

  // Install dependencies
  await spinner(`running: bun install`, () =>
    $`bun install`.quiet().cwd(projectName),
  )

  // Run setup script
  await spinner(`running: bun run setup`, () =>
    $`bun run setup`.quiet().cwd(projectName),
  )

  // Update wrangler.json
  await spinner(`updating wrangler.json`, async () => {
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
  console.log(chalk.green.bold("bun run dev"))
}
