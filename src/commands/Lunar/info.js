import { EmbedBuilder } from 'discord.js'

export const info = {
  name: 'info',
  aliases: ['about', 'help'],
  matchCase: false,
  category: 'Lunar',
  help: {
    usage: 'info',
    examples: ['info'],
    description: 'Shows information about the event'
  }
}

export const execute = async (instance, message) => {
  const guilds = Object.values(instance.config.guilds).map(g => {
    return `> ${g.emote || `**${g.color}**`} [${g.name}](${g.invite})`
  })

  const embed = new EmbedBuilder()
    .setAuthor({
      name: 'Lunar New Year of the Rabbit Event'
    })
    .setDescription(
      'We have organised a Lunar New Year event with awesome servers!\n\n' +
      'Rabbits will spawn in the participating servers. Collect the most you can!\n\n' +
      guilds.join('\n')
    )
    .setColor('#e0e0e0')

  await message.channel.send({ embeds: [embed] })
}
