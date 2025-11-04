import ora, { type Ora } from "ora"

export async function spinner(
  message: string,
  fn: (spinner: Ora) => Promise<unknown>,
) {
  const spinner = ora(message).start()
  try {
    await fn(spinner)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
