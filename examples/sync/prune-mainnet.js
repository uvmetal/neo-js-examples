/**
 * Prune Mainnet
 * This will identify excessive blocks and prune them.
 */
const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const network = 'mainnet'
const storageType = 'mongodb'
const dbConnectionString = 'mongodb://localhost/neo_mainnet'
const blockCollectionName = 'blocks'

// -- Implementation

;(async () => {
  console.log('== Prune Blocks - Mainnet ==')

  const neo = new Neo({
    network,
    storageType,
    storageOptions: {
      connectionString: dbConnectionString,
      collectionNames: {
        blocks: blockCollectionName,
      },
      loggerOptions: { level: 'info' },
    },
    meshOptions: {
      startBenchmarkOnInit: false,
      loggerOptions: { level: 'warn' },
    },
    apiOptions: {
      loggerOptions: { level: 'warn' },
    },
    syncerOptions: {
      startOnInit: false,
      loggerOptions: { level: 'warn' },
    },
    loggerOptions: { level: 'info' },
  })

  neo.storage.on('ready', async () => {
    console.log('neo.storage is ready.')

    const storageBlockCount = await neo.storage.getBlockCount()
    console.log('Highest Count in Storage:', storageBlockCount)
    const redundancy = neo.syncer.options.blockRedundancy
    console.log('target redundancy:', redundancy)

    const startHeight = 1
    const endHeight = storageBlockCount
    const report = await neo.storage.analyzeBlocks(startHeight, endHeight)

    const excessiveBlocks = _.map(_.filter(report, (item) => item.count > neo.syncer.options.blockRedundancy), (item) => item._id)
    console.log('excessiveBlocks count:', excessiveBlocks.length)

    if (excessiveBlocks.length === 0) {
      neo.close()
      console.log('=== THE END ===')
      return
    }

    console.log('attempt to prune blocks...')
    const MAX_PRUNE = 100
    const targetCount = excessiveBlocks.length > MAX_PRUNE ? MAX_SYNC : excessiveBlocks.length
    for (let i=0; i<targetCount; i++) {
      const h = excessiveBlocks[i]
      try {
        await neo.storage.pruneBlock(h, redundancy)
        console.log(`#${i} [${h}] pruned`)
      } catch (err) {
        console.log(`#${i} [${h}] Error message: ${err.message}`)
      }
    }

    neo.close()
    console.log('=== THE END ===')
  })
})()
