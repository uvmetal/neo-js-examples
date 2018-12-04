/**
 * Node class example usages
 */
const Neo = require('@cityofzion/neo-js').Neo

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const network = 'mainnet'
const txid = '1c8d4c661f0498a21fc69dc36e1b4290f4b53bad2dcb590171eaa90dc6ad7a1c'

// -- Implementation

;(async () => {
  console.log('== Node Example ==')

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
     * Attempt to find the fastest node known to mesh.
     */
    const node = neo.mesh.getFastestNode()

    /**
     * There's a chance that it returns undefined, be sure to validate the fetched data.
     */
    if (node) {
      /**
       * Attempt to fetch the transaction details of given TX ID.
       */
      const transactionObj = await node.getTransaction(txid)
      console.log('transactionObj:', transactionObj)
    } else {
      console.log('cannot find a valid node.')
    }

    /**
     * Close all background process associate with the neo instance.
     */
    neo.close()

    console.log('== THE END ==')
  })
})()
