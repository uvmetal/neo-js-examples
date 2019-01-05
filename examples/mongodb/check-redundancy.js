/**
 * MongoDB Storage usage - Redundancy check example.
 * It is possible for you to store same block multiple times for integration test purpose.
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
  console.log('== Redundancy Check Example ==')

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

    console.log('Analyzing blocks in storage. This may take a while...')
    const report = await neo.storage.analyzeBlocks(1, currentHeight)

    /**
     * An inefficient loop to analysis block count per redundancy level.
     */
    for (let i=1; i<=50; i++) {
      const redundancyCount = _.filter(report, (item) => (item.count === i)).length
      if (redundancyCount > 0) {
        console.log(`Count on blocks with redundancy of ${i}: ${redundancyCount}`)
      }
    }
    // <example response>
    // > Analyzing blocks in storage. This may take a while...
    // > Count on blocks with redundancy of 1: 591710
    // > Count on blocks with redundancy of 2: 343875
    // > Count on blocks with redundancy of 3: 14656
    // > Count on blocks with redundancy of 4: 13698
    // > Count on blocks with redundancy of 5: 15005
    // > Count on blocks with redundancy of 6: 11434
    // > Count on blocks with redundancy of 7: 6129
    // > Count on blocks with redundancy of 8: 3102

    /**
     * Close all background process associate with the neo instance.
     */
    neo.close()

    console.log('=== THE END ===')
  })
})()
