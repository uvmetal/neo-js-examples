/**
 * neo-mon Servers
 * Extract endpoint values from https://github.com/CityOfZion/neo-mon/blob/master/docs/assets/mainnet.json
 */
// const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')
const serverData = require('./mainnet.json')

// -- Implementation

;(async () => {
  console.log('== neo-mon Servers ==')

  // Fetch data
  const endpoints = []
  serverData.sites.forEach((site) => {
    if (site.type === 'RPC') {
      let endpoint = `${site.protocol}://${site.url}`
      if (site.port) {
        endpoint += `:${site.port}`
      }
      endpoints.push(endpoint)
    }
  })

  // Render output
  // const OUTPUT_TYPE = 'list'
  const OUTPUT_TYPE = 'object-array-text'
  if (OUTPUT_TYPE === 'list') {
    endpoints.forEach((endpoint) => {
      console.log('>', endpoint)
    })
  } else if (OUTPUT_TYPE === 'object-array-text') {
    console.log('[')
    endpoints.forEach((endpoint) => {
      console.log(`  { endpoint: '${endpoint}' },`)
    })
    console.log(']')
  }

  console.log('=== THE END ===')
})()
