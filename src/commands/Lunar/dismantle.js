import { EmbedBuilder } from 'discord.js'
import {getGlobalBalance, addBalance} from "../../utils/balance.js"
import {capitalise} from "../../utils/funcs.js"


export const info = {
  name: 'dismantle',
  aliases: ['destroy', "d"],
  matchCase: false,
  category: 'Lunar',
  help: {
    usage: 'dismantle <color> <animal> [amount, defaults to 1]',
    examples: ['dismantle red snake 2'],
    description: 'Dismantle animals for 5 currency each!'
  }
}

export const execute = async (instance, message, args) => {
  if (args.length < 2)
    return message.reply(`Not enough args! \`${info.help.usage}\``)

  const [colorProvided, animalProvided, amountProvided] = args;

  if (amountProvided !== undefined && Number.isNaN(Number.parseInt(amountProvided)))
    return message.reply("amount needs to be a number!")

  const allAnimals = instance.config.animals;
  const allColors = [...instance.config.colors, ...Object.values(instance.config.guilds).map(g => g.color)]

  const color = allColors.find(c => c.toLowerCase() === colorProvided.toLowerCase())
  const animal = allAnimals.find(c => c.toLowerCase() === animalProvided.toLowerCase())

  if (!color)
    return message.reply("The specified color does not exist!")
  if (!animal)
    return message.reply("The specified animal does not exist!")

  const amount = amountProvided !== undefined ? Number.parseInt(amountProvided) : 1;

  const { rows: [{ total: existing }] } = await instance.db.pool.query(
    "SELECT COUNT(id) as total FROM CLAIMS WHERE user_id=$1 AND animal=$2 AND color=$3",
    [message.author.id, animal, color]
  )
  if (existing < amount)
    return message.reply(
      `You only have ${existing} ${capitalise(color)} ${capitalise(animal)}, which is not enough for ${amount} :(`
    )

  await instance.db.pool.query(
    "DELETE FROM CLAIMS WHERE id IN (SELECT id FROM CLAIMS WHERE user_id=$1 AND animal=$2 AND color=$3 ORDER by id LIMIT $4)",
    [message.author.id, animal, color, amount]
  )
  const toAdd = amount * 5;
  addBalance(instance, message.author, message.guild, toAdd, `Destroyed ${amount} of ${color} ${animal}`)

  return message.reply(
    `You gained ${toAdd} currency for destroying ${amount} ${capitalise(color)} ${capitalise(animal)}, begone!`
  )
}
