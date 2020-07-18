/* eslint-disable no-console */
import webpack from 'webpack'
import config from '../webpack.config.prod'
import * as chalkConfig from './chalkConfig'

// process.env.NODE_ENV = process.env.ENV || "production";
console.log('starting build in environment', process.env.NODE_ENV)

console.log(chalkConfig.chalkProcessing('generating minified bundle. This will take a moment ...'))

webpack(config).run((error, stats) => {
  if (error) {
    console.log(chalkConfig.chalkError(error))
    return 1
  }
  const jsonStats = stats.toJson()
  if (jsonStats.hasErrors) {
    return jsonStats.errors.map(error => console.log(chalkConfig.chalkError(error)))
  }
  if (jsonStats.hasWarning) {
    console.log(chalkConfig.chalkWarning('webpack generated the following warning'))
    jsonStats.warning.map(warning => console.log(chalkConfig.chalkWarning(warning)))
  }
  console.log(`webpack stats: ${stats}`)
  console.log(chalkConfig.chalkSuccess("your app is compiled in production mode in /dist. It's ready to roll"))
  return 0
})
