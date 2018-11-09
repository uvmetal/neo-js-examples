/**
 * MongoDB Storage usage - Redundancy check example
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

  console.log('Waiting for neo.storage to be ready...')
  neo.storage.on('ready', async () => {
    console.log('neo.storage is now ready!')

    console.log('Analyzing blocks in storage. This may take a while...')
    const report = await neo.storage.analyzeBlocks(0, 1000000)

    for (let i=1; i<=10; i++) {
      const redundancyCount = _.filter(report, (item) => (item.count === i)).length
      console.log(`Count on blocks with redundancy of [${i}]: ${redundancyCount}`)
      // <example response>
      // > Analyzing blocks in storage. This may take a while...
      // > Count on blocks with redundancy of [1]: 591710
      // > Count on blocks with redundancy of [2]: 343875
      // > Count on blocks with redundancy of [3]: 14656
      // > Count on blocks with redundancy of [4]: 13698
      // > Count on blocks with redundancy of [5]: 15005
      // > Count on blocks with redundancy of [6]: 11434
      // > Count on blocks with redundancy of [7]: 6129
      // > Count on blocks with redundancy of [8]: 3102
    }

    /**
     * Close all background process associate with the neo instance.
     */
    neo.close()

    console.log('=== THE END ===')
  })
})()
