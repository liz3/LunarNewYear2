import { EmbedBuilder } from 'discord.js'
import { getGlobalBalance, addBalance } from "../../utils/balance.js"
import {
  getRandom,
  capitalise,
  generatePath,
  readImageFile,
  handleClaim,
} from "../../utils/funcs.js";

export const info = {
  name: 'highroll',
  aliases: ['hr'],
  matchCase: false,
  category: 'Lunar',
  help: {
    usage: 'highroll',
    examples: ['highroll'],
    description: 'Use 50 currency for a random animal with the chance to get a rabbit'
  }
}

export const execute = async (instance, message) => {
  const balance = await getGlobalBalance(instance, message.author)

  if (balance < 50)
    return message.reply(`Not enough balance! (Your balance is ${balance})`)
  const animal = getRandom(instance.config.chances_highroll);
  const chance_color = [...instance.config.chances_color]
  if(animal === "rabbit")
    chance_color.push(instance.config.chance_white)
  const color = getRandom(chance_color);

  const path = generatePath(animal, color);
  await Promise.all([
    addBalance(instance, message.author, message.guild, -50),
    handleClaim(instance, message.author, { animal, color }, message)
  ])
  const file = await readImageFile(path)
  const embed = new EmbedBuilder()
    .setTitle(
      `You got ${capitalise(color)} ${capitalise(animal)} for 50 currency!`
    )
    .setThumbnail("attachment://image.png")
    .setColor(instance.config.hex_codes[color]);
  await message.reply({
    embeds: [embed],
    files: [{ attachment: file, name: "image.png" }],
  });
}
