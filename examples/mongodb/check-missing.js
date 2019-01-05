/**
 * Script to check for missing blocks in MongoDB storage.
 */
const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const storageType = 'mongodb'
const dbConnectionString = 'mongodb://localhost/neo_mainnet'
const blockCollectionName = 'blocks'

// -- Implementation

;(async () => {
  console.log('== Missing Check Example ==')

  /**
   * Neo instantiation along with storage settings.
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
    },
    meshOptions: {
      startBenchmarkOnInit: false,
    },
    syncerOptions: {
      startOnInit: false,
    },
  })

  /**
   * By binding an event listener to neo.storage, you will be able to determine
   * when the database connection is ready to go.
   */
  console.log('Waiting for neo.storage to be ready...')
  neo.storage.on('ready', async () => {
    console.log('neo.storage is now ready!')

    /**
     * Fetch 'current height', which is the document contains the highest
     * 'height' value.
     */
    const currentHeight = await neo.storage.getHighestBlockHeight()
    console.log('currentHeight:', currentHeight)
    // <example response>
    // > currentHeight: 2957600

    /**
     * Perform block analysis to entire block range in storage.
     * The report will looks something like:
     * [
     *   { _id: 1, count: 1 },
     *   { _id: 2, count: 4 },
     *   ...
     * ]
     */
    console.log('Analyzing blocks in storage. This may take a while...')
    const report = await neo.storage.analyzeBlocks(1, currentHeight)
    console.log(`Analyze blocks complete.`)

    /**
     * Build an one-dimensional array to has number from 1 to current height.
     * Example:
     * [ 1, 2, 3, .... 1000 ]
     */
    const all = []
    for (let i = 1; i <= currentHeight; i++) {
      all.push(i)
    }

    /**
     * Assume we are after the redundancy of 1.
     * This will build an one-dimensional (unsorted) array of available heights.
     * Example:
     * [ 1, 2, 5, 7 ... ]
     */
    const availableBlocks = _.map(report, (item) => item._id)
    console.log('availableBlocks.length:', availableBlocks.length)

    /**
     * This will build an one-dimensional (unsorted) array of missing heights
     * (by subtracting all heights with available heights).
     * Example:
     * [ 3, 4, 6, ... ]
     */
    const missingBlocks = _.difference(all, availableBlocks)
    console.log('missingBlocks.length:', missingBlocks.length)

    /**
     * List all missing height number.
     */
    console.log('missing blocks:')
    missingBlocks.forEach((height) => {
      console.log('>', height)
    })

    /**
     * Close all background process associate with the neo instance.
     */
    neo.close()

    console.log('=== THE END ===')
  })
})()
