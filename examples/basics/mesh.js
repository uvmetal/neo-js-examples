/**
 * Mesh class example usages
 */
const Neo = require('@cityofzion/neo-js').Neo

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const network = 'testnet'
const waitSeconds = 6

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
  console.log('== Mesh Example ==')

  /**
   * Most basic neo instantiation.
   */
  const neo = new Neo({
    network,
  })

  /**
   * Mesh benchmark is running in the background by default.
   * It will determine performance of each node.
   */

  /**
   * In this example, we'll wait out, give time to mesh to benchmark enough nodes.
   */
  console.log(`Wait for ${waitSeconds} seconds allowing neo.mesh to benchmark enough nodes...`)
  await sleep(waitSeconds * 1000)

  console.log('Analyze all nodes:')
  for (let i=0; i<neo.mesh.nodes.length; i++) {
    /**
     * Iterate through node list.
     */
    const node = neo.mesh.nodes[i]
    console.log(`> #${i} ${node.endpoint} [isActive: ${node.isActive}] [blockHeight: ${node.blockHeight}] [latency: ${node.latency}] [UA: ${node.userAgent}]`)
  }
  // <example response>
  // > Analyze all nodes:
  // > > #0 https://test1.cityofzion.io:443 [isActive: true] [blockHeight: 1985652] [latency: 1169] [UA: /NEO:2.8.0/]
  // > > #1 https://test2.cityofzion.io:443 [isActive: true] [blockHeight: 1985652] [latency: 1180] [UA: /NEO:2.8.0/]
  // > > #2 https://test3.cityofzion.io:443 [isActive: true] [blockHeight: 1985652] [latency: 1155] [UA: /NEO:2.8.0/]
  // > > #3 https://test4.cityofzion.io:443 [isActive: true] [blockHeight: 1985652] [latency: 886] [UA: /NEO:2.8.0/]
  // > > #4 https://test5.cityofzion.io:443 [isActive: true] [blockHeight: 1985652] [latency: 1294] [UA: /NEO:2.8.0/]

  /**
   * Fetch an active node that has the lowest latency.
   */
  const fastestActiveNode = neo.mesh.getFastestNode(true)
  if (fastestActiveNode) {
    console.log('fastestActiveNode:')
    console.log('> endpoint:', fastestActiveNode.endpoint)
    console.log('> lastSeenTimestamp:', fastestActiveNode.lastSeenTimestamp)
    console.log('> latency:', fastestActiveNode.latency)
    console.log('> blockHeight:', fastestActiveNode.blockHeight)
    // <example response>
    // > fastestActiveNode:
    // > > endpoint: https://test2.cityofzion.io:443
    // > > lastSeenTimestamp: 1541764019685
    // > > latency: 916
    // > > blockHeight: 1985659  
  } else {
    console.log('Unable to find a fastestActiveNode.')
  }

  /**
   * Close all background process associate with the neo instance.
   */
  neo.close()

  console.log('== THE END ==')
})()
