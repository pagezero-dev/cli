import ora, { type Ora } from "ora"

export async function spinner(message: string, fn: (oraSpinner: Ora) => Promise<unknown>) {
  const oraSpinner = ora(message).start()
  try {
    await fn(oraSpinner)
    oraSpinner.succeed()
  } catch (error) {
    oraSpinner.fail()
    throw error
  }
}
