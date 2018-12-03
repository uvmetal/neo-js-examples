const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')
const moment = require('moment')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const storageType = 'mongodb'
const dbConnectionString = 'mongodb://localhost/neo_mainnet'

// -- Implementation

;(async () => {
  console.log('== Block Meta Analyzer ==')

  const neo = new Neo({
    storageType,
    enableBlockMetaAnalyzer: true,
    meshOptions: {
      startBenchmarkOnInit: false,
    },
    storageOptions: {
      connectionString: dbConnectionString,
      loggerOptions: { level: 'warn' },
    },
    syncerOptions: {
      startOnInit: false,
    },
    blockMetaAnalyzerOptions: {
      loggerOptions: { level: 'info' },
    },
    loggerOptions: { level: 'info' },
  })

  console.log('Waiting for neo.storage to be ready...')
  neo.storage.on('ready', async () => {
    console.log('neo.storage is now ready!')
    neo.blockMetaAnalyzer.start()
  })

  neo.blockMetaAnalyzer.on('upToDate', () => {
    console.log('Storage sync is now up-to-date!')
    neo.close()
    console.log('== THE END ==')
  })

  // Generate sync report
  const SYNC_REPORT_INTERVAL_MS = 5 * 1000
  setInterval(async () => {
    const storageHeight = await neo.storage.getBlockCount()
    const metaHeight = await neo.storage.getBlockMetaCount()
    const completionPercentage = _.round((metaHeight / storageHeight * 100), 2) + '%'

    console.log(`[${moment().utc().format('HH:mm:ss')}] ${metaHeight}/${storageHeight} | complete: ${completionPercentage}`)
  }, SYNC_REPORT_INTERVAL_MS)
})()
