/**
 * MongoDB Storage usage - Missing block check example
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
const startHeight = 1
const endHeight = 1428566

// -- Implementation

;(async () => {
  console.log('== Missing Check Example ==')

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
    const report = await neo.storage.analyzeBlocks(startHeight, endHeight)
    console.log(`Analyze blocks complete.`)

    const all = []
    for (let i = startHeight; i <= endHeight; i++) {
      all.push(i)
    }

    const availableBlocks = _.map(report, (item) => item._id) // NOTE: Assume we are after redundancy of 1
    console.log('availableBlocks count:', availableBlocks.length)

    const missingBlocks = _.difference(all, availableBlocks)
    console.log('missingBlocks count:', missingBlocks.length)

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
