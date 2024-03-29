/**
 * Fetching version information of neo-js.
 */
const Neo = require('@cityofzion/neo-js').Neo

// -- Implementation

;(async () => {
  console.log('== Get Version Example ==')

  /**
   * Version information can be fetched via class as static property.
   */

  console.log('Neo class version:', Neo.VERSION)
  // <example response>
  // > Neo class version: 0.13.0

  console.log('Neo class user agent:', Neo.UserAgent)
  // <example response>
  // > Neo class user agent: NEO-JS:0.13.0

  console.log('== THE END ==')
})()
