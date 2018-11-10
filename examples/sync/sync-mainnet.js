/**
 * Sync Mainnet
 */
const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')
const moment = require('moment')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const network = 'mainnet'
const dbConnectionString = 'mongodb://localhost/neo_mainnet'
const blockCollectionName = 'blocks'

// -- Implementation

;(async () => {
  console.log('== Sync Mainnet ==')

  const neo = new Neo({
    network: network,
    storageType: 'mongodb',
    storageOptions: {
      connectionString: dbConnectionString,
      collectionNames: {
        blocks: blockCollectionName,
      },
      loggerOptions: { level: 'info' },
    },
    meshOptions: {
      loggerOptions: { level: 'warn' },
    },
    syncerOptions: {
      // minHeight: 1001,
      // maxHeight: 1200,
      // verifyBlocksIntervalMs: 20 * 1000,
      storeQueueConcurrency: 60,
      loggerOptions: { level: 'info' },
    },
    loggerOptions: { level: 'info' },
  })

  // Fetch block height info upon mesh ready
  neo.mesh.on('ready', async () => {
    try {
      const blockchainHeight = await neo.mesh.getHighestNode().blockHeight
      console.log('Blockchain Height:', blockchainHeight)
    } catch (err) {
      console.warn('neo.mesh.getHighestNode().blockHeight failed. Message:', err.message)
    }
  })
  neo.storage.on('ready', async () => {
    try {
      const storageBlockCount = await neo.storage.getBlockCount()
      console.log('Highest Count in Storage:', storageBlockCount)
    } catch (err) {
      console.warn('neo.storage.getBlockCount() failed. Message:', err.message)
    }
  })

  // Info when sync is detected to be 'up to date'
  neo.syncer.on('UpToDate', () => {
    console.log('Storage sync is now up-to-date!')
  })


  // Sync report feed
  const report = {
    success: [],
    failed: [],
    max: undefined,
    startDate: moment()
  }
  neo.syncer.on('storeBlock:complete', (payload) => {
    const item = {
      height: payload.height,
      date: moment(),
    }
    if (payload.isSuccess) {
      report.success.push(item)
    } else {
      report.failed.push(item)
    }
  })

  // Log sync report periodically
  const SYNC_REPORT_INTERVAL_MS = 5 * 1000
  setInterval(() => {
    if (report.success.length === 0) {
      console.log('No sync progress yet')
      return
    }

    const node = neo.mesh.getHighestNode()
    if (!node) {
      console.warn('Problem with neo.mesh.getHighestNode().')
      return
    }

    report.max = node.blockHeight
    const msElapsed = moment().diff(report.startDate)
    const successBlockCount = report.success.length
    const highestBlock = report.success[report.success.length - 1].height // This is an guesstimate
    const completionPercentage = Number((highestBlock / report.max * 100).toFixed(4))
    const blockCountPerMinute = Number((successBlockCount / msElapsed * 1000 * 60).toFixed(0))
    console.log(`Blocks synced: ${successBlockCount} (${completionPercentage}% complete) - ${blockCountPerMinute} blocks/minute`)
  }, SYNC_REPORT_INTERVAL_MS)
})()
