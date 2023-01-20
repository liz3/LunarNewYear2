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
    (g.whitelist && !g.whitelist.includes(message.channel.id)) ||
    (g.blacklist && g.blacklist.includes(message.channel.id))
  ) return

  // calculate random chances of a spawn for this message
  const k = `lny2023:${message.guild.id}`
  const last = await instance.redis.get(k)
  // ToDo: Needs randomisation with percentage, but no idea what to set right now
  // calculate something that's fair for users given the event length (14 days)
  if (!isNaN(last) && Date.now() - parseInt(last) < 30000) return

  const amt = Math.round(Math.random() * 122)
  const emote = g.emote || '🐇'
  const hasReacted = []

  const s = Symbol(message.guild.id)
  running[message.guild.id] = s
  const spawnReact = await message.react(emote)
  console.log(`! Spawned ${amt} ${g.color} rabbits in ${g.name}`)
  message
    .createReactionCollector({
      filter: (r, u) => running[message.guild.id] === s && !u.bot && (r.emoji.name === '🐇'),
      time: 15_000
    })
    .on('collect', async (r, u) => {
      if (hasReacted.includes(u.id)) return
      await addBalance(instance, u, message.guild.id, amt)
      hasReacted.push(u.id)
    })
    .on('end', collected => {
      delete running[message.guild.id]
      instance.redis.set(k, Date.now().toString()).catch(console.error)
      if (collected.size === 0) {
        spawnReact.users.remove().catch(() => {})
        return
      }

      message.channel
        .send(`🐰 ${hasReacted.map(u => `<@!${u}>`).join(', ')} collected ${amt}${emote}!`)
        .catch(console.error)
    })
}
