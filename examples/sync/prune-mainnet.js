/**
 * Prune Blocks from Mainnet
 * One off script to prune blocks with excessive redundancies.
 */
const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')
const moment = require('moment')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const storageType = 'mongodb'
const dbConnectionString = 'mongodb://localhost/neo_mainnet'
const blockCollectionName = 'blocks'

// -- Implementation

;(async () => {
  console.log('== Prune Blocks - Mainnet ==')

  /**
   * Neo instantiation along with customizations.
   * Since we have no interest of using syncer and mesh, we can explicit disable their background processes.
   * Notice that we did not specific network option as it is unimportant in this example.
   * Be sure that the database is running, and there are sufficient blocks in the specified collection.
   */
  const neo = new Neo({
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

  /**
   * By binding an event listener to neo.storage, you will be able to determine
   * when the storage instance is ready to be used.
   */
  console.log('Waiting for neo.storage to be ready...')
  neo.storage.on('ready', async () => {
    console.log('neo.storage is ready.')

    /**
     * Fetch 'current height', which is the document contains the highest
     * 'height' value.
     */
    const currentHeight = await neo.storage.getHighestBlockHeight()
    console.log('currentHeight:', currentHeight)

    const redundancy = neo.syncer.options.blockRedundancy
    console.log('target redundancy:', redundancy)

    /**
     * Perform block analysis to entire block range in storage.
     * The report will looks something like:
     * [
     *   { _id: 1, count: 1 },
     *   { _id: 2, count: 4 },
     *   ...
     * ]
     */
    console.log(`[${moment().utc().format('HH:mm:ss')}] Analyze blocks...`)
    const report = await neo.storage.analyzeBlocks(1, currentHeight)
    console.log(`[${moment().utc().format('HH:mm:ss')}] Analyze blocks complete.`)

    /**
     * Filter and build an one-dimensional (unsorted) array of height with excessive redundancies.
     * Example:
     * [ 3, 4, 6, ... ]
     */
    const excessiveBlocks = _.map(_.filter(report, (item) => item.count > neo.syncer.options.blockRedundancy), (item) => item._id)
    console.log('excessiveBlocks.length:', excessiveBlocks.length)

    if (excessiveBlocks.length === 0) {
      neo.close()
      console.log('=== THE END ===')
      return
    }

    /**
     * Perform active pruning of the blocks 1 by 1, up to the specific
     * cap (as MAX_PRUNE).
     */
    console.log('attempt to prune blocks...')
    const MAX_PRUNE = 100
    const targetCount = excessiveBlocks.length > MAX_PRUNE ? MAX_PRUNE : excessiveBlocks.length
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
