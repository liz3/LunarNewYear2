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
  name: 'force',
  aliases: [],
  matchCase: false,
  category: 'Owner',
  ownerOnly: true,
  help: {
    usage: 'roll',
    examples: ['roll'],
    description: 'Use 20 currency for a random animal'
  }
}

export const execute = async (instance, message, args) => {
  if(!["175408504427905025", "195906408561115137"].includes(message.author.id))
    return;
  const [color, animal] = args;

  const path = generatePath(animal, color);
  await Promise.all([handleClaim(instance, message.author, {
    animal, color
  }, message)])
  const file = await readImageFile(path)
   const embed = new EmbedBuilder()
    .setTitle(
      ` You got ${capitalise(color)} ${capitalise(
        animal
      )}`
    )
    .setImage("attachment://image.png")
    .setColor(instance.config.hex_codes[color]);
  await message.reply({
    embeds: [embed],
    files: [{ attachment: file, name: "image.png" }],
  });

}
