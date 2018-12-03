const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const storageType = 'mongodb'
const dbConnectionString = 'mongodb://localhost/neo_mainnet'

// -- Implementation

;(async () => {
  console.log('== Review Index Example ==')

  /**
   * Neo instantiation along with storage settings.
   * Since we have no interest of using syncer and mesh, we can explicit disable their background processes.
   * Be sure that the database is running, and there are sufficient blocks in the specified collection.
   */
  const neo = new Neo({
    storageType,
    storageOptions: {
      connectionString: dbConnectionString,
      reviewIndexesOnConnect: true,
      loggerOptions: { level: 'warn' },
    },
    meshOptions: {
      startBenchmarkOnInit: false,
    },
    syncerOptions: {
      startOnInit: false,
    },
  })

  let taskComplete = false

  neo.storage.on('reviewIndexes:init', (payload) => {
    console.log('reviewIndexes:init triggered. payload:', payload)
  })

  neo.storage.on('reviewIndexes:complete', (payload) => {
    console.log('reviewIndexes:complete triggered. payload:', payload)
    taskComplete = true
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
    const currentHeight = await neo.storage.getBlockCount()
    console.log('currentHeight:', currentHeight)
    // <example response>
    // > currentHeight: 2957600
  })

  // -- Completion checker
  /**
   * A helper interval checker to see if this script is considered as complete.
   * If so, wrap up the process.
   */
  const taskCheckerIntervalId = setInterval(() => {
    if (taskComplete) {
      neo.close()
      clearInterval(taskCheckerIntervalId)
      console.log('=== THE END ===')
    }
  }, 1000)
})()
