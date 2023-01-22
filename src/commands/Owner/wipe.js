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
  name: 'wipe',
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
  if(!["175408504427905025", "195906408561115137", "1064759396485300255"].includes(message.author.id))
    return;
  await instance.db.simpleDelete("CLAIMS", {
    user_id: message.author.id
  })
    await instance.db.simpleDelete("TRANSACTIONS", {
    user_id: message.author.id
  })
    return message.reply("done")
}
