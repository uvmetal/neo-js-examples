/**
 * API class example usages
 */
const Neo = require('@cityofzion/neo-js').Neo

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const network = 'testnet'

// -- Implementation

;(async () => {
  console.log('== API Example ==')

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
     * Perform query through API class.
     * The method will attempt to fetch from storage first. However, since storage
     * was never specified, it will always attempt to fetch from the blockchain.
     */
    const count = await neo.api.getBlockCount()
    console.log('getBlockCount:', count)
    // <example response>
    // > getBlockCount: 1985630

    /**
     * Close all background process associate with the neo instance.
     */
    neo.close()
    console.log('== THE END ==')
  })
})()
