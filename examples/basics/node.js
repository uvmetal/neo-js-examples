/**
 * Node class example usages
 */
const Neo = require('@cityofzion/neo-js').Neo

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const network = 'mainnet'

// -- Implementation

;(async () => {
  console.log('== Node Example ==')

  /**
   * Most basic neo instantiation.
   */
  const neo = new Neo({
    network,
  })

  console.log('Waiting for neo.mesh to be ready...')
  neo.mesh.on('ready', async () => {
    console.log('neo.mesh is now ready!')

    const n = neo.mesh.getFastestNode()
    if (n) {
      const txid = '1c8d4c661f0498a21fc69dc36e1b4290f4b53bad2dcb590171eaa90dc6ad7a1c'
      const t = await n.getTransaction(txid)
      console.log('t:', t)
    } else {
      console.log('cannot find a valid node.')
    }

    neo.close()
    console.log('== THE END ==')
  })
})()
