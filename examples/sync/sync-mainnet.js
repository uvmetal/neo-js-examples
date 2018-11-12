/**
 * Sync Mainnet
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
  console.log('== Sync Mainnet ==')

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
    syncerOptions: {
      // minHeight: 1001,
      // maxHeight: 1200,
      // verifyBlocksIntervalMs: 20 * 1000,
      storeQueueConcurrency: 60,
      loggerOptions: { level: 'info' },
    },
    loggerOptions: { level: 'info' },
  })

  // Fetch block height info upon mesh ready
  neo.mesh.on('ready', async () => {
    console.log('neo.mesh is ready.')
    try {
      const blockchainHeight = await neo.mesh.getHighestNode().blockHeight
      console.log('Blockchain Height:', blockchainHeight)
    } catch (err) {
      console.warn('neo.mesh.getHighestNode().blockHeight failed. Message:', err.message)
    }
  })
  neo.storage.on('ready', async () => {
    console.log('neo.storage is ready.')
    try {
      const storageBlockCount = await neo.storage.getBlockCount()
      console.log('Highest Count in Storage:', storageBlockCount)
    } catch (err) {
      console.warn('neo.storage.getBlockCount() failed. Message:', err.message)
    }
  })

  // Info when sync is detected to be 'up to date'
  neo.syncer.on('UpToDate', () => {
    console.log('Storage sync is now up-to-date!')
  })

  // Live reporting
  const report = {
    successCount: 0,
    failedCount: 0,
    missingCount: undefined,
    excessiveCount: undefined,
    blockchainHeight: undefined,
    syncHeight: undefined,
    startAt: moment(),
  }
  neo.syncer.on('storeBlock:complete', (payload) => {
    if (payload.isSuccess) {
      report.successCount += 1
      if (!report.syncHeight || payload.height > report.syncHeight) {
        report.syncHeight = payload.height
      }
    } else {
      report.failedCount += 1
    }
  })
  neo.syncer.on('blockVerification:missingBlocks', (payload) => {
    // console.log('blockVerification:missingBlocks triggered. payload:', payload)
    report.missingCount = payload.count
  })
  neo.syncer.on('blockVerification:excessiveBlocks', (payload) => {
    // console.log('blockVerification:excessiveBlocks triggered. payload:', payload)
    report.excessiveCount = payload.count
  })

  // Generate sync report
  const SYNC_REPORT_INTERVAL_MS = 5 * 1000
  setInterval(() => {
    if (report.successCount === 0) {
      console.log('No sync progress yet')
      return
    }

    const node = neo.mesh.getHighestNode()
    if (!node) {
      console.warn('Problem with neo.mesh.getHighestNode().')
      return
    }

    report.blockchainHeight = node.blockHeight
    const msElapsed = moment().diff(report.startAt)
    const trueSyncCount = (report.missingCount) ? report.syncHeight - report.missingCount : report.syncHeight
    const completionPercentage = _.round((trueSyncCount / report.blockchainHeight * 100), 4) + '%'
    const blockCountPerMinute = _.round((report.successCount / msElapsed * 1000 * 60), 0)
    const failPercentage = _.round((report.failedCount / (report.successCount + report.failedCount) * 100), 2) + '%'

    let missingPercentage = 'N/A'
    if (report.missingCount !== undefined) {
      missingPercentage = _.round((report.missingCount / report.syncHeight * 100), 2) + '%'
    }

    let excessivePercentage = 'N/A'
    if (report.excessiveCount !== undefined) {
      excessivePercentage = _.round((report.excessiveCount / trueSyncCount * 100), 2) + '%'
    }

    const requiredMs = _.round((report.blockchainHeight - trueSyncCount) / (report.successCount / msElapsed), 0)
    const etaText = moment.duration(requiredMs).humanize(true)

    console.log(`[${moment().utc().format('HH:mm:ss')}] ${trueSyncCount}/${report.blockchainHeight} | complete: ${completionPercentage} | ${blockCountPerMinute} blocks/min (ETA ${etaText}) | failure: ${failPercentage} | missing: ${missingPercentage} | excessive: ${excessivePercentage}`)
  }, SYNC_REPORT_INTERVAL_MS)

  // Generate mesh report
  const MESH_REPORT_INTERVAL_MS = 60 * 1000
  setInterval(() => {
    console.log('## NODES REPORT:')
    const nodePool = _.filter(neo.mesh.nodes, (n) => (n.isActive && n.pendingRequests > 0))
    if (nodePool.length === 0) {
      console.log('> No active pending nodes')
    }

    nodePool.forEach((n) => {
      console.log(`> pending: ${n.pendingRequests} | latency: ${n.latency}| height: ${n.blockHeight} | UA: ${n.userAgent} | ${n.endpoint}`)
    })
  }, MESH_REPORT_INTERVAL_MS)
})()
