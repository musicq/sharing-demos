import {parentPort} from 'worker_threads'
import fsp from 'fs/promises'
import vm from 'vm'

async function runTests(testFile) {
  const code = await fsp.readFile(testFile, 'utf8')
  const testResult = {success: false, errorMessage: null}

  try {
    const expect = received => ({
      toBe: expected => {
        if (received !== expected) {
          throw new Error(`Expected ${expected} but received ${received}.`)
        }

        return true
      },
    })

    // eval(code)
    const context = {expect, setTimeout}

    vm.createContext(context)
    await vm.runInContext(code, context)

    testResult.success = true
  } catch (e) {
    testResult.errorMessage = e.message
  }

  return testResult
}

parentPort.on('message', async testFile => {
  const result = await runTests(testFile)
  parentPort.postMessage(result)
})
