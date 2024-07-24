import {glob} from 'glob'
import {fileURLToPath} from 'url'
import path from 'path'
import {createWorkerPool} from '@musicq/toolbox'
import chalk from 'chalk'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const testFiles = glob.sync('./tests/*.test.js')

const workerPool = createWorkerPool(path.resolve(dirname, 'worker.js'))

let hasFailed = false

await Promise.all(
  testFiles.map(testFile => {
    return new Promise(async resolve => {
      const filePath = path.resolve(dirname, testFile)

      workerPool.getWorker(worker => {
        worker.on('message', async testResult => {
          resultRender(testResult, filePath)
          workerPool.releaseWorker(worker)
          resolve()
        })

        worker.postMessage(filePath)
      })
    })
  })
).finally(() => workerPool.destroy())

if (hasFailed) {
  console.log(
    '\n' + chalk.red.bold('Test run failed, please fix all the failing tests.')
  )
  // Set an exit code to indicate failure.
  process.exitCode = 1
}

function resultRender({success, errorMessage}, filePath) {
  const status = success
    ? chalk.green.inverse.bold(' PASS ')
    : chalk.red.inverse.bold(' FAIL ')

  console.log(status + ' ' + chalk.dim(path.relative(dirname, filePath)))

  if (!success) {
    hasFailed = true
    console.log('\n  ' + errorMessage + '\n')
  }
}
