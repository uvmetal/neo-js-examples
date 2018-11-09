/**
 * Fetching version information of neo-js.
 */
const Neo = require('@cityofzion/neo-js').Neo

// -- Implementation

;(async () => {
  console.log('== Get Version Example ==')

  console.log('Neo class version:', Neo.VERSION)
  // <example response>
  // > Neo class version: 0.10.0-rc.1

  console.log('Neo class user agent:', Neo.UserAgent)
  // <example response>
  // > Neo class user agent: NEO-JS:0.10.0-rc.1

  console.log('== THE END ==')
})()
