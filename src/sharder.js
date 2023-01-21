import 'dotenv/config'
import { ShardingManager } from 'discord.js'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const shardManager = new ShardingManager(
  join(dirname(fileURLToPath(import.meta.url)), 'index.js'),
  { token: process.env.BOT_TOKEN }
)
shardManager.on('shardCreate', shard => {
  console.log(`Shard ${shard.id} spawned`)
})

if (!process.env.BOT_TOKEN) {
  console.error('no token, no fun')
  process.exit(1)
}
if (!process.env.REDIS_URI) {
  console.error('no redis, no fun')
  process.exit(1)
}

shardManager.spawn().catch(err => {
  console.error(err)
  shardManager.broadcastEval(() => process.exit(1)).catch(() => null)
  process.exit(1)
})
