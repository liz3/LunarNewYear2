import { addBalance } from '../utils/balance.js'

export const eventName = 'messageCreate'

const running = {}

export const execute = async (instance, message) => {
  if (
    !instance.config.guildIds.includes(message.guild.id) &&
    message.guild.id !== instance.config.staffGuild
  ) {
    console.log(`! Detected unauthorised guild ${message.guild.id}, leaving..`)
    await message.guild.leave().catch(console.error)
    return
  }
  if (message.author.bot || running[message.guild.id]) return

  const g = instance.config.guilds[message.guild.id]
  if (
    !g ||
    (g.whitelist && !g.whitelist.includes(message.channel.id)) ||
    (g.blacklist && g.blacklist.includes(message.channel.id))
  ) return

  // calculate random chances of a spawn for this message
  const k = `lny2023:${message.guild.id}`
  const last = await instance.redis.get(k)
  // ToDo: Needs randomisation with percentage, but no idea what to set right now
  // calculate something that's fair for users given the event length (14 days)
  if (!isNaN(last) && Date.now() - parseInt(last) < 30000) return

  const emote = g.emote || '🐇'
  const hasReacted = {}

  const s = Symbol(message.guild.id)
  running[message.guild.id] = s
  const spawnReact = await message.react(emote)
  console.log(`! Spawned a ${g.color} rabbit in ${g.name}`)
  message
    .createReactionCollector({
      filter: (r, u) => running[message.guild.id] === s && !u.bot && (r.emoji.name === '🐇'),
      time: 15_000
    })
    .on('collect', async (r, u) => {
      if (hasReacted[u.id]) return
      hasReacted[u.id] = u
    })
    .on('end', collected => {
      delete running[message.guild.id]
      instance.redis.set(k, Date.now().toString()).catch(console.error)
      if (collected.size === 0) {
        spawnReact.users.remove().catch(() => {})
        return
      }
      const uids = Object.keys(hasReacted)
      uids.forEach(uid =>
        addBalance(instance, hasReacted[uid], message.guild.id).catch(console.error)
      )

      message.channel
        .send(`🐰 ${uids.map(u => `<@!${u}>`).join(', ')} collected a ${emote}!`)
        .catch(console.error)
    })
}
