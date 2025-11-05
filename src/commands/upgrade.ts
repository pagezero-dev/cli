import { confirm } from "@inquirer/prompts"
import boxen from "boxen"
import { $, file } from "bun"
import chalk from "chalk"
import logSymbols from "log-symbols"
import { spinner } from "../utils"

export async function upgrade({ powerup }: { powerup?: boolean }) {
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

  if (powerup) {
    await spinner(`downloading latest PageZERO PowerUP edition`, () =>
      $`git clone --depth 1 https://github.com/pagezero-dev/powerup.git pagezero-latest`.quiet(),
    )
  } else {
    await spinner(`downloading latest PageZERO stack`, () =>
      $`git clone --depth 1 https://github.com/pagezero-dev/pagezero.git pagezero-latest`.quiet(),
    )
  }

  await spinner(`copying PageZERO stack to project directory`, () =>
    $`rsync -a --exclude=".git" ./pagezero-latest/ ./`.quiet(),
  )

  await spinner(`cleaning up`, () => $`rm -rf pagezero-latest`.quiet())

  console.log(chalk.green("PageZERO stack upgraded successfully"))
  console.log(chalk.green.bold("Please review the changes through a git diff"))
}
