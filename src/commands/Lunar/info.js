import { EmbedBuilder } from 'discord.js'
import {capitalise} from "../../utils/funcs.js"

export const info = {
  name: 'info',
  aliases: ['about'],
  matchCase: false,
  category: 'Lunar',
  help: {
    usage: 'info',
    examples: ['info'],
    description: 'Shows information about the event'
  }
}

export const execute = async (instance, message) => {
  const guilds = Object.values(instance.config.guilds).filter(g => g.private !== true)
  const rabbits = guilds.map(g => {
    return `> ${g.emote || `*${capitalise(g.color)} Rabbit*`}`
  })
  const invites = guilds.map(g => {
    return `[${g.name}](${g.invite})`
  })

  const embed = new EmbedBuilder()
    .setAuthor({
      name: 'Lunar New Year of the Rabbit Event'
    })
    .setDescription(
      'We have organised a Lunar New Year event with awesome servers!\n\n' +
      'Animals of different colors will appear on all servers! ' +
      'Every server also has a special colored rabbit that might appear sometimes.\n' +
      '...and legends have it that in a special moment if all the good spirits align there might be a white rabbit, ' +
      'but these are just legends, right?\n\n'
    )
    .addFields([
      { name: 'Rabbits', value: rabbits.join('\n'), inline: true },
      { name: 'Servers', value: invites.join('\n'), inline: true }
    ])
    .setColor('#e0e0e0')

  await message.channel.send({ embeds: [embed] })
}
