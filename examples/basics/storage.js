/**
 * Storage class example usages
 */
const Neo = require('@cityofzion/neo-js').Neo

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const storageType = 'mongodb'
const dbConnectionString = 'mongodb://localhost/neo_mainnet'
const blockCollectionName = 'blocks'

// -- Implementation

;(async () => {
  console.log('== Storage (MongoDB) Example ==')

  /**
   * Neo instantiation along with storage settings.
   * Since we have no interest of using syncer and mesh, we can explicit disable their background processes.
   * Notice that we did not specific network option as it is unimportant in this example.
   * Be sure that the database is running, and there are sufficient blocks in the specified blocks collection.
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

  console.log('Waiting for neo.storage to be ready...')
  neo.storage.on('ready', async () => {
    console.log('neo.storage is now ready!')

    /**
     * Perform query on the storage itself (oppose to the blockchain).
     */
    const targetHeight = 1
    const block = await neo.storage.getBlock(targetHeight)
    console.log(`getBlocks(${targetHeight}):`)
    console.log('> height:', block.index)
    console.log('> timestamp:', block.time)
    console.log('> hash:', block.hash)
    // <example response>
    // > getBlocks(1):
    // > > height: 1
    // > > timestamp: 1476647382
    // > > hash: 0xd782db8a38b0eea0d7394e0f007c61c71798867578c77c387c08113903946cc9

    /**
     * Close all background process associate with the neo instance.
     */
    neo.close()

    console.log('=== THE END ===')
  })
})()
