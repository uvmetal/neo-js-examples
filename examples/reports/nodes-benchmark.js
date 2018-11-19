/**
 * Nodes Benchmark Report
 */
const Neo = require('@cityofzion/neo-js').Neo
const _ = require('lodash')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const network = 'mainnet'
const reportIntervalMs = 10 * 1000

// -- Implementation
/**
 * A helper function to emulate terminal's sleep command.
 */
const sleep = async (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

;(async () => {
  console.log('== Nodes Benchmark Report ==')

  /**
   * Neo instantiation along with mesh and node settings.
   * Since we have no interest of using syncer and mesh, we can explicit disable their background processes.
   * Notice that we did not specific network option as it is unimportant in this example.
   */
  const neo = new Neo({
    network,
    meshOptions: {
      benchmarkIntervalMs: 500,
    },
    nodeOptions: {
      toLogReliability: true,
    },
    syncerOptions: {
      startOnInit: false,
    },
  })

  /**
   * By binding an event listener to neo.mesh, you will be able to determine
   * when the mesh instance has enough identified node to be useful.
   */
  console.log('Waiting for neo.mesh to be ready...')
  neo.mesh.on('ready', async () => {
    console.log('neo.mesh is now ready!')

    /**
     * Give mesh some time to build up its logs
     */
    console.log('wait for a bit...')
    await sleep(30 * 1000)
    console.log('ready to run!')
     
    /**
     * Periodically perform and output a report.
     * Mesh is constantly benchmark nodes in the background, hence each report
     * should be show latest updates of nodes.
     */
    setInterval(() => {
      console.log(`[${new Date()}]:`)

      /**
       * Iterate through all nodes and print out their recorded status and properties
       */
      for (let i=0; i<neo.mesh.nodes.length; i++) {
        const node = neo.mesh.nodes[i]
      
        const reliabilityPercentage = (node.getNodeReliability() === undefined) ? 'N/A' : (_.round((node.getNodeReliability() * 100), 2) + '%')
        const lastPingText = (node.lastPingTimestamp) ? _.round((Date.now() - node.lastPingTimestamp) / 1000, 0) + 's' : 'N/A'
        console.log(`> ${i} [active: ${node.isActive}] [height: ${node.blockHeight}] [lastPing: ${lastPingText}] [lat: ${node.latency}] [shapedLat: ${node.getShapedLatency()}] [UA: ${node.userAgent}] [reliability: ${reliabilityPercentage}] [log count: ${node.requestLogs.length}] ${node.endpoint}`)
      }
      console.log()
    }, reportIntervalMs)
    // <example response>
    // > > 0 [active: true] [height: 2979794] [lastPing: 13s] [lat: 9416] [shapedLat: 3846] [UA: /Neo:2.9.2/] [reliability: 100%] [log count: 4] https://seed1.switcheo.network:10331
    // > > 1 [active: true] [height: 2979795] [lastPing: 2s] [lat: 1532] [shapedLat: 1194] [UA: /Neo:2.9.0/] [reliability: 66.67%] [log count: 3] https://seed2.switcheo.network:10331
    // > > 2 [active: true] [height: 2979790] [lastPing: 11s] [lat: 15587] [shapedLat: 15587] [UA: /Neo:2.9.0/] [reliability: 50%] [log count: 2] https://seed3.switcheo.network:10331
    // > > 3 [active: false] [height: undefined] [lastPing: 5s] [lat: undefined] [shapedLat: NaN] [UA: undefined] [reliability: 0%] [log count: 1] https://seed4.switcheo.network:10331
    // > > 4 [active: false] [height: undefined] [lastPing: 5s] [lat: undefined] [shapedLat: NaN] [UA: undefined] [reliability: 0%] [log count: 1] https://seed5.switcheo.network:10331
    // > > 5 [active: true] [height: 2979750] [lastPing: 10s] [lat: 1309] [shapedLat: 1004] [UA: /NEO:2.8.0/] [reliability: 100%] [log count: 5] https://seed1.cityofzion.io:443
    // > > 6 [active: true] [height: 2979751] [lastPing: 8s] [lat: 775] [shapedLat: 967] [UA: /NEO:2.8.0/] [reliability: 100%] [log count: 5] https://seed2.cityofzion.io:443
  })
})()
