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

;(async () => {
  console.log('== Nodes Benchmark Report ==')

  /**
   * Most basic neo instantiation.
   */
  const neo = new Neo({
    network,
  })

  /**
   * By binding an event listener to neo.mesh, you will be able to determine
   * when the mesh instance has enough identified node to be useful.
   */
  console.log('Waiting for neo.mesh to be ready...')
  neo.mesh.on('ready', async () => {
    console.log('neo.mesh is now ready!')

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
        console.log(`> #${i} ${node.endpoint} [isActive: ${node.isActive}] [blockHeight: ${node.blockHeight}] [latency: ${node.latency}] [UA: ${node.userAgent}]`)
      }
      console.log()
    }, reportIntervalMs)
    // <example response>
    // > > #0 https://seed1.cityofzion.io:443 [isActive: true] [blockHeight: 2961938] [latency: 1663] [UA: /NEO:2.8.0/]
    // > > #1 https://seed2.cityofzion.io:443 [isActive: true] [blockHeight: 2961918] [latency: 1138] [UA: /NEO:2.8.0/]
    // > > #2 https://seed3.cityofzion.io:443 [isActive: true] [blockHeight: 2961991] [latency: 1089] [UA: /NEO:2.8.0/]
    // > > #3 https://seed4.cityofzion.io:443 [isActive: true] [blockHeight: 2961992] [latency: 2426] [UA: /NEO:2.8.0/]
    // > > #4 https://seed5.cityofzion.io:443 [isActive: true] [blockHeight: 2961979] [latency: 809] [UA: /NEO:2.8.0/]
    // > > #5 https://seed6.cityofzion.io:443 [isActive: true] [blockHeight: 2961998] [latency: 1763] [UA: /NEO:2.7.6.1/]
    // > > #6 https://seed7.cityofzion.io:443 [isActive: true] [blockHeight: 2961993] [latency: 1239] [UA: /NEO:2.7.6.1/]
    // > > #7 https://seed8.cityofzion.io:443 [isActive: true] [blockHeight: 2961995] [latency: 1779] [UA: /NEO:2.7.6.1/]
    // > > #8 https://seed9.cityofzion.io:443 [isActive: true] [blockHeight: 2962005] [latency: 1236] [UA: /NEO:2.7.6.1/]
    // > > #9 https://seed0.cityofzion.io:443 [isActive: true] [blockHeight: 2962003] [latency: 1327] [UA: /NEO:2.8.0/]
  })
})()
