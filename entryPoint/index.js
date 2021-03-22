const fs = require('fs').promises
const childProcess = require('child_process')

const dataDir = '/tmp/extendo-compute'
const inputFile = `${dataDir}/input.json`
const outputFile = `${dataDir}/output.json`
const errorFile = `${dataDir}/error.json`

module.exports.handler = async (event) => {
  try {
    // Since Lambda can reuse containers, clean up our key files from what might have been a previous run.
    await fs.rm(outputFile, { force: true })
    await fs.rm(errorFile, { force: true })

    // Grab the event parts and stash for use by the target handler.
    // Note the difference here between this and Node deployed in a zip. 
    // See https://github.com/aws/aws-lambda-nodejs-runtime-interface-client/issues/17
    const { params, contextParts } = event
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(inputFile, JSON.stringify(params, null, 2))

    // run the command line spec'd in the environment (left there when we built the image) and include any context
    const child = childProcess.exec(process.env.CMD_LINE, { env: { GITHUB_TOKEN: contextParts.token } })
    await new Promise((resolve, reject) => {
      child.stdout.on('data', data => console.log(`child-out: ${data}`))
      child.stderr.on('data', data => console.log(`child-err: ${data}`))
      child.on('error', error => reject(error))
      child.on('exit', code => {
        // purposefully reject with a non-Error here so the catch knows to look for an error file
        if (code !== 0) return reject('Exec exited with non-zero code: ' + code)
        resolve()
      })
    })

    // Grab the output and return it as an object. 
    // Note the difference here between this and Node deployed in a zip. 
    // See https://github.com/aws/aws-lambda-nodejs-runtime-interface-client/issues/17
    const output = await fs.readFile(outputFile)
    return JSON.parse(output)
  } catch (error) {
    // rethrow if it's already an error. Likely means that it happened in this wrapper
    if (error instanceof Error) throw error
    try {
      // See if the nested handler left us an error file. If so, re throw whatever they left 
      const output = await fs.readFile(errorFile)
      throw JSON.parse(output)
    } catch (err) {
      // all else fails, rethrow the original object (known not to be an Error)
      throw error
    }
  }
}
