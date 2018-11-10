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

  console.log('Waiting for neo.mesh to be ready...')
  neo.mesh.on('ready', async () => {
    console.log('neo.mesh is now ready!')

    const intervalId = setInterval(() => {
      console.log(`[${new Date()}]:`)
      for (let i=0; i<neo.mesh.nodes.length; i++) {
        const node = neo.mesh.nodes[i]
        console.log(`> #${i} ${node.endpoint} [isActive: ${node.isActive}] [blockHeight: ${node.blockHeight}] [latency: ${node.latency}]`)
      }
      console.log()
    }, reportIntervalMs)
  })
})()
