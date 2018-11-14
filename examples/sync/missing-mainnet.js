/**
 * Sync for missing blocks on Mainnet
 * One off script to find missing blocks and sync them.
 */
const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')
const moment = require('moment')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

/**
 * Explicitly provide list of node endpoints instead of its default list.
 */
const endpoints = [
  { endpoint: 'https://seed1.switcheo.network:10331' },
  { endpoint: 'https://seed2.switcheo.network:10331' },
  { endpoint: 'https://seed3.switcheo.network:10331' },
  { endpoint: 'https://seed4.switcheo.network:10331' },
  { endpoint: 'https://seed5.switcheo.network:10331' },
  { endpoint: 'http://seed1.travala.com:10332' },
  { endpoint: 'https://seed1.neo.org:10331' },
  { endpoint: 'http://seed2.neo.org' },
  { endpoint: 'http://seed3.neo.org' },
  { endpoint: 'http://seed4.neo.org' },
  { endpoint: 'http://seed5.neo.org' },
  { endpoint: 'http://api.otcgo.cn' },
  { endpoint: 'https://seed1.cityofzion.io:443' },
  { endpoint: 'https://seed2.cityofzion.io:443' },
  { endpoint: 'https://seed3.cityofzion.io:443' },
  { endpoint: 'https://seed4.cityofzion.io:443' },
  { endpoint: 'https://seed5.cityofzion.io:443' },
  { endpoint: 'https://seed0.cityofzion.io:443' },
  { endpoint: 'https://seed6.cityofzion.io:443' },
  { endpoint: 'https://seed7.cityofzion.io:443' },
  { endpoint: 'https://seed8.cityofzion.io:443' },
  { endpoint: 'https://seed9.cityofzion.io:443' },
  { endpoint: 'http://node1.ams2.bridgeprotocol.io' },
  { endpoint: 'http://node2.ams2.bridgeprotocol.io' },
  { endpoint: 'http://node1.nyc3.bridgeprotocol.io' },
  { endpoint: 'http://node2.nyc3.bridgeprotocol.io' },
  { endpoint: 'http://node1.sgp1.bridgeprotocol.io' },
  { endpoint: 'http://node2.sgp1.bridgeprotocol.io' },
  { endpoint: 'https://seed1.redpulse.com:443' },
  { endpoint: 'https://seed2.redpulse.com:443' },
  { endpoint: 'http://seed1.aphelion-neo.com:10332' },
  { endpoint: 'http://seed2.aphelion-neo.com:10332' },
  { endpoint: 'http://seed3.aphelion-neo.com:10332' },
  { endpoint: 'http://seed4.aphelion-neo.com:10332' },
  { endpoint: 'https://seed1.spotcoin.com:10332' },
  { endpoint: 'http://rustylogic.ddns.net:10332' },
  { endpoint: 'http://seed1.ngd.network:10332' },
  { endpoint: 'http://seed2.ngd.network:10332' },
  { endpoint: 'http://seed3.ngd.network:10332' },
  { endpoint: 'http://seed4.ngd.network:10332' },
  { endpoint: 'http://seed5.ngd.network:10332' },
  { endpoint: 'http://seed6.ngd.network:10332' },
  { endpoint: 'http://seed7.ngd.network:10332' },
  { endpoint: 'http://seed8.ngd.network:10332' },
  { endpoint: 'http://seed9.ngd.network:10332' },
  { endpoint: 'http://seed10.ngd.network:10332' },
  { endpoint: 'https://seed1.red4sec.com:10332' },
  { endpoint: 'http://seed.neoeconomy.io:10332' },
  { endpoint: 'http://node1.plutolo.gy:10332' },
  { endpoint: 'http://seed1.cryptoholics.cc:10332' },
  { endpoint: 'http://neo-node.com:10332' },
]
const storageType = 'mongodb'
const dbConnectionString = 'mongodb://localhost/neo_mainnet'
const blockCollectionName = 'blocks'

// -- Implementation

;(async () => {
  console.log('== Sync Missing Blocks - Mainnet ==')

  /**
   * Neo instantiation along with customizations.
   * Notice that we did not specific network option as we will be providing endpoints explicitly instead.
   * Be sure that the database is running ready for sync.
   */
  const neo = new Neo({
    endpoints,
    storageType,
    storageOptions: {
      connectionString: dbConnectionString,
      collectionNames: {
        blocks: blockCollectionName,
      },
      loggerOptions: { level: 'info' },
    },
    meshOptions: {
      minActiveNodesRequired: 5,
      pendingRequestsThreshold: 3,
      loggerOptions: { level: 'warn' },
    },
    apiOptions: {
      loggerOptions: { level: 'warn' },
    },
    syncerOptions: {
      startOnInit: false,                   // Disable syncing progress in the background
      loggerOptions: { level: 'warn' },
    },
    loggerOptions: { level: 'info' },
  })

  /**
   * Print blockchain's height upon neo.mesh is ready.
   */
  neo.storage.on('ready', async () => {
    console.log('neo.storage is ready.')

    /**
     * Fetch 'current height', which is the document contains the highest
     * 'height' value.
     */
    const currentHeight = await neo.storage.getBlockCount()
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
    console.log(`[${moment().utc().format('HH:mm:ss')}] Analyze blocks...`)
    const report = await neo.storage.analyzeBlocks(1, currentHeight)
    console.log(`[${moment().utc().format('HH:mm:ss')}] Analyze blocks complete.`)

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
    console.log('availableBlocks count:', availableBlocks.length)

    /**
     * This will build an one-dimensional (unsorted) array of missing heights
     * (by subtracting all heights with available heights).
     * Example:
     * [ 3, 4, 6, ... ]
     */
    const missingBlocks = _.difference(all, availableBlocks)
    console.log('missingBlocks count:', missingBlocks.length)

    if (missingBlocks.length === 0) {
      neo.close()
      console.log('=== THE END ===')
      return
    }

    /**
     * Perform active syncing of the missing blocks 1 by 1, up to the specific
     * cap (as MAX_SYNC).
     */
    console.log('attempt to sync for missing blocks...')
    const MAX_SYNC = 100
    const targetCount = missingBlocks.length > MAX_SYNC ? MAX_SYNC : missingBlocks.length
    for (let i=0; i<targetCount; i++) {
      const h = missingBlocks[i]
      try {
        /**
         * By performing api.getBlock(), it will programmatically detected that
         * the storage does not have the desire block, and will attempt to fetch
         * data from blockchain and store in database.
         */
        const b = await neo.api.getBlock(h)
        console.log(`[${moment().utc().format('HH:mm:ss')}] #${i} [${h}] hash: ${b.hash}`)
      } catch (err) {
        console.log(`[${moment().utc().format('HH:mm:ss')}] #${i} [${h}] Error message: ${err.message}`)
      }
    }

    neo.close()
    console.log('=== THE END ===')
  })
})()
