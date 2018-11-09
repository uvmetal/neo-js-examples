const Neo = require('neo-js').Neo

// -- Implementation

;(async () => {
  console.log('== Get Version Example ==')
  console.log('Neo class version:', Neo.VERSION)
  console.log('Neo class user agent:', Neo.UserAgent)
  console.log('== THE END ==')
})()
