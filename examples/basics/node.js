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
      // <example response>
      // > transactionObj: { txid:
      // >   '0x1c8d4c661f0498a21fc69dc36e1b4290f4b53bad2dcb590171eaa90dc6ad7a1c',
      // >  size: 236,
      // >  type: 'ContractTransaction',
      // >  version: 0,
      // >  attributes: [],
      // >  vin:
      // >   [ { txid:
      // >        '0x493131cbef1cab6dc55f8e1fea7a32dd78f1cd495047494e8dd56d4f14449a4e',
      // >       vout: 0 },
      // >     { txid:
      // >        '0xab8e3521544b2758b5359f04ef2df1f82c17f333ac00ba481dfd50cd5de6ca6d',
      // >       vout: 0 } ],
      // >  vout:
      // >   [ { n: 0,
      // >       asset:
      // >        '0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b',
      // >       value: '11',
      // >       address: 'AXBqyrYTaLmF8RcZUENZhyug1ZFqmk7WuS' } ],
      // >  sys_fee: '0',
      // >  net_fee: '0',
      // >  scripts:
      // >   [ { invocation:
      // >        '4033e0f8ea6eced97b3b67cb2e5fd40c471e44317ee9c34c3ccb618cfa4922cc47138d0940fbb959fb247907dd0c1deadc558714f36e54410b6141dd8a73859630',
      // >       verification:
      // >        '2103dab40392b5684cbb4b6a6aa83615a491b86eb2bd5d014d289e09840232b09b79ac' } ],
      // >  blockhash:
      // >   '0xa9388cceeb981bfd877fb1dfa31a16eee294d33947ac39034ca581a50529da2b',
      // >  confirmations: 30560,
      // >  blocktime: 1543230055 }
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
