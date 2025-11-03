import { confirm } from "@inquirer/prompts"
import boxen from "boxen"
import { $, file } from "bun"
import chalk from "chalk"
import logSymbols from "log-symbols"
import ora from "ora"

export async function upgrade() {
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
