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
  console.log('== Block Analyzer ==')

  const neo = new Neo({
    storageType,
    enableSyncer: false,
    enableBlockAnalyzer: true,
    meshOptions: {
      startBenchmarkOnInit: false,
    },
    storageOptions: {
      connectionString: dbConnectionString,
      loggerOptions: { level: 'warn' },
    },
    blockAnalyzerOptions: {
      // minHeight: 400000,
      loggerOptions: { level: 'info' },
    },
    loggerOptions: { level: 'info' },
  })

  console.log('Waiting for neo.storage to be ready...')
  neo.storage.on('ready', async () => {
    console.log('neo.storage is now ready!')
    neo.blockAnalyzer.start()
  })

  neo.blockAnalyzer.on('upToDate', () => {
    console.log('Block analyzer is now up-to-date!')
  })

  neo.blockAnalyzer.on('blockVerification:init', () => {
    console.log('Block verification init...')
  })

  neo.blockAnalyzer.on('blockVerification:complete', (payload) => {
    console.log('Block verification complete. payload:', payload)
  })

  neo.blockAnalyzer.on('blockVerification:missingBlockMetas', (payload) => {
    console.log('blockVerification:blockMetas:missing triggered. payload:', payload)
  })

  neo.blockAnalyzer.on('blockVerification:legacyBlockMetas', (payload) => {
    console.log('blockVerification:blockMetas:legacy triggered. payload:', payload)
  })

  neo.blockAnalyzer.on('blockVerification:transactionMetas:missing', (payload) => {
    console.log('blockVerification:transactionMetas:missing triggered. payload:', payload)
  })

  neo.blockAnalyzer.on('blockVerification:transactionMetas:legacy', (payload) => {
    console.log('blockVerification:transactionMetas:legacy triggered. payload:', payload)
  })

  neo.blockAnalyzer.on('upToDate', () => {
    console.log('Storage sync is now up-to-date!')
    neo.close()
    console.log('== THE END ==')
  })

  // Generate sync report
  const SYNC_REPORT_INTERVAL_MS = 5 * 1000
  let isReportRunning = false
  setInterval(async () => {
    if (!isReportRunning) {
      isReportRunning = true
      const storageHeight = await neo.storage.getHighestBlockHeight()
      const metaHeight = await neo.storage.getHighestBlockMetaHeight()
      const completionPercentage = _.round((metaHeight / storageHeight * 100), 4) + '%'
      isReportRunning = false
      console.log(`[${moment().utc().format('HH:mm:ss')}] ${metaHeight}/${storageHeight} | complete: ${completionPercentage}`)
    } else {
      console.log('An instance of report is still running...')
    }
  }, SYNC_REPORT_INTERVAL_MS)
})()
