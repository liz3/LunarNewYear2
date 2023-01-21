import { EmbedBuilder } from 'discord.js'
import {getGlobalBalance, addBalance} from "../../utils/balance.js"
import {
  getRandom,
  capitalise,
  generatePath,
  readImageFile,
  handleClaim,
} from "../../utils/funcs.js";

export const info = {
  name: 'roll',
  aliases: ['r'],
  matchCase: false,
  category: 'Lunar',
  help: {
    usage: 'roll',
    examples: ['roll'],
    description: 'Roll 20 currency for a random '
  }
}

export const execute = async (instance, message) => {
  const balance = await getGlobalBalance(instance, message.author)

  if(balance < 20)
    return message.reply(`Not enough balance, your balance is ${balance}`)

  const animal = getRandom(instance.config.chances_animals);
  const color = getRandom(instance.config.chances_color);

  const path = generatePath(animal, color);
  await Promise.all([addBalance(instance, message.author, message.guild, -20), handleClaim(instance, message.author, {
    animal, color
  }, message)])
  const file = await readImageFile(path)
   const embed = new EmbedBuilder()
    .setTitle(
      ` You got ${capitalise(color)} ${capitalise(
        animal
      )} for 20 currency!`
    )
    .setImage("attachment://image.png")
    .setColor(instance.config.hex_codes[color]);
  await message.reply({
    embeds: [embed],
    files: [{ attachment: file, name: "image.png" }],
  });



}
