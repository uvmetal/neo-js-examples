/**
 * Simple test on depending neon-js library.
 */
const Neon = require('@cityofzion/neon-js')

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled rejection. Reason:', reason)
})

// -- Parameters

const rpcUrl = 'https://seed1.cityofzion.io:443'
const blockHeight = 1
const verboseKey = 1

// -- Implementation

;(async () => {
  console.log('== neon.js Example ==')

  const q = new Neon.rpc.Query({ method: 'getblock', params: [blockHeight, verboseKey] })
  const block = await q.execute(rpcUrl)
  console.log('block:', block)
  // <example response>
  // > block: { jsonrpc: '2.0',
  // > id: 1234,
  // > result:
  // >  { hash:
  // >     '0xd782db8a38b0eea0d7394e0f007c61c71798867578c77c387c08113903946cc9',
  // >    size: 686,
  // >    version: 0,
  // >    previousblockhash:
  // >     '0xd42561e3d30e15be6400b6df2f328e02d2bf6354c41dce433bc57687c82144bf',
  // >    merkleroot:
  // >     '0xd6ba8b0f381897a59396394e9ce266a3d1d0857b5e3827941c2d2cedc38ef918',
  // >    time: 1476647382,
  // >    index: 1,
  // >    nonce: '6c727071bbd09044',
  // >    nextconsensus: 'APyEx5f4Zm4oCHwFWiSTaph1fPBxZacYVR',
  // >    script:
  // >     { invocation:
  // >        '404edf5005771de04619235d5a4c7a9a11bb78e008541f1da7725f654c33380a3c87e2959a025da706d7255cb3a3fa07ebe9c6559d0d9e6213c68049168eb1056f4038a338f879930c8adc168983f60aae6f8542365d844f004976346b70fb0dd31aa1dbd4abd81e4a4aeef9941ecd4e2dd2c1a5b05e1cc74454d0403edaee6d7a4d4099d33c0b889bf6f3e6d87ab1b11140282e9a3265b0b9b918d6020b2c62d5a040c7e0c2c7c1dae3af9b19b178c71552ebd0b596e401c175067c70ea75717c8c00404e0ebd369e81093866fe29406dbf6b402c003774541799d08bf9bb0fc6070ec0f6bad908ab95f05fa64e682b485800b3c12102a8596e6c715ec76f4564d5eff34070e0521979fcd2cbbfa1456d97cc18d9b4a6ad87a97a2a0bcdedbf71b6c9676c645886056821b6f3fec8694894c66f41b762bc4e29e46ad15aee47f05d27d822',
  // >       verification:
  // >        '552102486fd15702c4490a26703112a5cc1d0923fd697a33406bd5a1c00e0013b09a7021024c7b7fb6c310fccf1ba33b082519d82964ea93868d676662d4a59ad548df0e7d2102aaec38470f6aad0042c6e877cfd8087d2676b0f516fddd362801b9bd3936399e2103b209fd4f53a7170ea4444e0cb0a6bb6a53c2bd016926989cf85f9b0fba17a70c2103b8d9d5771d8f513aa0869b9cc8d50986403b78c6da36890638c3d46a5adce04a2102ca0e27697b9c248f6f16e085fd0061e26f44da85b58ee835c110caa5ec3ba5542102df48f60e8f3e01c48ff40b9b7f1310d7a8b2a193188befe1c2e3df740e89509357ae' },
  // >    tx: [ [Object] ],
  // >    confirmations: 2941403,
  // >    nextblockhash:
  // >     '0xbf638e92c85016df9bc3b62b33f3879fa22d49d5f55d822b423149a3bca9e574' } }

  console.log('== THE END ==')
})()
