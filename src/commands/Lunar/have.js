import { EmbedBuilder } from 'discord.js'
import {getGlobalBalance, addBalance} from "../../utils/balance.js"
import {capitalise, readImageFile, generatePath} from "../../utils/funcs.js"


export const info = {
  name: 'have',
  aliases: ['h'],
  matchCase: false,
  category: 'Lunar',
  help: {
    usage: 'have color animal',
    examples: ['have red snake'],
    description: 'Check if you have a certain animal!'
  }
}

export const execute = async (instance, message, args) => {
  if(args.length < 2)
    return message.reply("not enough args")
  const [colorProvided, animalProvided] = args;
  const allAnimals = instance.config.animals;
  const allColors = [...instance.config.colors, ...Object.values(instance.config.guilds).map(g => g.color)]
  const color = allColors.find(c => c.toLowerCase() === colorProvided.toLowerCase())
  const animal = allAnimals.find(c => c.toLowerCase() === animalProvided.toLowerCase())

  if(!color) 
    return message.reply("This color does not exist")
  if(!animal)
    return message.send("This animal does not exist")


  const {rows: [{total: existing}]} = await instance.db.pool.query("SELECT COUNT(id) as total FROM CLAIMS WHERE user_id=$1 AND animal=$2 AND color=$3", [message.author.id, animal, color])

    const file = await readImageFile(generatePath(animal, color))
   const embed = new EmbedBuilder()
    .setTitle(
      ` You have ${existing} ${capitalise(color)} ${capitalise(
        animal
      )}!`
    )
    .setThumbnail("attachment://image.png")
    .setColor(instance.config.hex_codes[color]);
  return message.reply({
    embeds: [embed],
    files: [{ attachment: file, name: "image.png" }],
  });


}
