/**
 * API class example usages
 */
const Neo = require('@cityofzion/neo-js').Neo

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled promise rejection. Reason:', reason)
})

// -- Implementation

;(async () => {
  console.log('== API Example ==')

  /**
   * Instantiate with testnet blockchain.
   */
  const testnetNeo = new Neo({
    network: 'testnet',
  })

  console.log('Waiting for neo.mesh to be ready...')
  testnetNeo.mesh.on('ready', async () => {
    console.log('neo.mesh is now ready!')

    /**
     * Perform query through API class.
     */
    const count = await testnetNeo.api.getBlockCount()
    console.log('Testnet getBlockCount:', count)
    // <example response>
    // > Testnet getBlockCount: 1985630

    /**
     * Close all background process associate with the neo instance.
     */
    testnetNeo.close()
    console.log('== THE END ==')
  })
})()
