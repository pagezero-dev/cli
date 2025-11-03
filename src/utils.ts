import ora from "ora"

export async function log(message: string, fn: () => Promise<unknown>) {
  const spinner = ora(message).start()
  try {
    await fn()
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
