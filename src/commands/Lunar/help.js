import { EmbedBuilder } from 'discord.js'
import {capitalise} from "../../utils/funcs.js"

export const info = {
  name: 'help',
  aliases: ['?'],
  matchCase: false,
  category: 'Lunar',
  help: {
    usage: 'help',
    examples: ['help'],
    description: 'Shows help about the bot'
  }
}

export const execute = async (instance, message) => {

  return message.reply(`
The Bot spawns Animals of different colours whenever someone send a message in the bots channel with a cooldown of 30 seconds.
You claim the animal by reacting to the message, the first person to react gets the animal and 5 currency, every one else gets 1 currency.

Animals are: rat, Ox, Tiger, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig, Dragon And rabbit, the last 3 so Pig, Dragon and rabbit each have a smaller chance of spawning then the previous.
Colours are: Blue, Green, Orange, Red, Violet and Yellow. Further every server has a specially coloured Rabbit and theres a white rabbit.

The Servers coloured rabbit can only appear on that server.
The white rabbit can appear anywhere but is very rare.

The bot has a few commands
**ly!info**: Prints all servers wuith their respective rabbit and the invite link
**ly!progress**: Shows you your balance and the amount of white rabbits aswell as the amount of rabbits of the current server you have, it then gives you the 5th animals you have the highest amount of
**ly!roll**: Uses 20 currency to roll a random animal. Can be anything but a rabbit.
**ly!have**: takes colour and animal type, so as example: "ly!have red snake" and displays the amount of that combination the user has
**ly!dismantle**: takes color animal(and optionally) amount, so as example: "blue horse 3" and destroys them if you own them for 5 currency each. so if you destroy 3 blue horses you get 15 currency. anything can be destroyed.`)
}
