/**
 * Missing Mainnet
 * This will search for missing blocks and sync them.
 */
const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')
const moment = require('moment')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const network = 'mainnet'
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
// const dbConnectionString = 'mongodb://localhost/neo_mainnet'
const dbConnectionString = 'mongodb://localhost/neo_mainnet_beck'
const blockCollectionName = 'blocks'

// -- Implementation

;(async () => {
  console.log('== Sync Missing Blocks - Mainnet ==')

  const neo = new Neo({
    network,
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
      loggerOptions: { level: 'debug' },
    },
    syncerOptions: {
      startOnInit: false,
      loggerOptions: { level: 'info' },
    },
    loggerOptions: { level: 'info' },
  })

  neo.storage.on('ready', async () => {
    console.log('neo.storage is ready.')

    const storageBlockCount = await neo.storage.getBlockCount()
    console.log('Highest Count in Storage:', storageBlockCount)

    const startHeight = 1
    const endHeight = storageBlockCount
    const report = await neo.storage.analyzeBlocks(startHeight, storageBlockCount)
    // console.log('report:', report)

    const all = []
    for (let i = startHeight; i <= endHeight; i++) {
      all.push(i)
    }

    const availableBlocks = _.map(report, (item) => item._id) // NOTE: Assume we are after redundancy of 1
    console.log('availableBlocks count:', availableBlocks.length)

    const missingBlocks = _.difference(all, availableBlocks)
    console.log('missingBlocks count:', missingBlocks.length)
    // console.log('missingBlocks:', missingBlocks)

    if (missingBlocks.length === 0) {
      neo.close()
      console.log('=== THE END ===')
      return
    }

    missingBlocks.forEach((missingHeight) => {
      neo.api.getBlock(missingHeight)
    })
  })
})()
