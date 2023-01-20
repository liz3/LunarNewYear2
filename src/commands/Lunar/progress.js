import { EmbedBuilder } from 'discord.js'
import { getBalance, getGlobalBalance } from '../../utils/balance.js'

export const info = {
  name: 'progress',
  aliases: ['balance', 'bal', '$'],
  matchCase: false,
  category: 'Lunar',
  help: {
    usage: 'bal',
    examples: ['bal'],
    description: 'Shows the progress on the event'
  }
}

export const execute = async (instance, message) => {
  const progress = await Promise.all([
    getGlobalBalance(instance, message.author)
      .then(stats => {
        const claims =
          Object
            .keys(stats)
            .map(animal => `> ${animal} ${stats[animal]}`) // still needs emotes
        return claims.join('\n') + '\n'
      }),
    ...instance.config.guildIds.map(guild =>
      new Promise((resolve, reject) => {
        const g = instance.config.guilds[guild]
        getBalance(instance, message.author, guild)
          .then(bal => resolve(`> ${g.emote || `**${g.color}**`} ${bal}`))
          .catch(reject)
      })
    )
  ])

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Progress for ${message.author.tag}`,
      iconURL: message.author.avatarURL()
    })
    .setDescription(
      progress.join('\n') +
      '\n\nCollect them all from all the participating servers!'
    )
    .setColor('#e0e0e0')

  await message.channel.send({ embeds: [embed] })
}
