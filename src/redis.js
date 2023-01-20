import Redis from 'ioredis'

export default (uri, waitForReady = false) => {
  return new Promise((resolve, reject) => {
    const client = new Redis(uri)
    if (!waitForReady) {
      resolve(client)
      return
    }

    client.on('ready', () => {
      resolve(client)
    })

    client.on('error', error => {
      reject(error)
    })
  })
}
