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
   * Notice the explicit "reviewIndexesOnConnect: true", this will initiates review indexes task when storage is ready.
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

  /**
   * Add event listener to inform us when the review indexes task has began.
   */
  neo.storage.on('reviewIndexes:init', (payload) => {
    console.log('reviewIndexes:init triggered. payload:', payload)
  })

  /**
   * Add event listener to inform us when the review indexes task has completed.
   */
  neo.storage.on('reviewIndexes:complete', (payload) => {
    console.log('reviewIndexes:complete triggered. payload:', payload)
    taskComplete = true
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
