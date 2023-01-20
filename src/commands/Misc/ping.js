import { EmbedBuilder } from 'discord.js'

export const info = {
  name: 'ping',
  matchCase: false,
  category: 'Misc',
  help: {
    usage: 'ping',
    examples: ['ping'],
    description: 'Pong!'
  }
}

export const execute = async (instance, message) => {
  const msgPing = Date.now() - message.createdTimestamp
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'Bot Latency' })
    .setDescription(
        `🏓 Command: \`${msgPing}ms\`\n` +
          `💓 Gateway: \`${instance.client.ws.ping}ms\``
    )
    .setColor('#e0e0e0')

  await message.channel.send({ embeds: [embed] })
}
