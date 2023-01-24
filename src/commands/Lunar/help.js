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

const CD = {

}
const MESSAGE = `> **Welcome to Lunar New Year 2023: Year of the Rabbit!**
> This bot spawns animals of different colours whenever someone sends a message, with a cooldown of 60 seconds, and a random chance.
> You claim the animal by reacting to the message. The first person to react, gets the animal plus 5 currency. Everyone else gets 1 currency.
> Animals are: Rat, Ox, Tiger, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig, Dragon, and Rabbit.
> **-** *Pigs, Dragons, and Rabbits are special, each having a smaller chance of spawning than the other animals.*
> Colours are: Blue, Green, Orange, Red, Violet, and Yellow. Every server additionally has a specially coloured Rabbit.
> **-** There's also a *rare* White Rabbit you should look for!
> The server-coloured rabbits can only appear on their home server.
> **-** Check out all of them if you wanna collect all the Rabbits!
> The White Rabbit can appear anywhere, but is very rare.
> The bot has a few commands for the event:
> **ly!info**: Shows all participating servers with their respective rabbit and their invite link.
> **ly!progress**: Shows your or a users balance and the amount of rabbits they have, plus the 5 animals they have the highest amount of.
> **ly!roll**: Uses 20 currency to roll a random animal. Can be anything but a rabbit.
> **ly!highroll**: Uses 50 currency to roll a random animal, with the chance of a rabbit, cannot be a server rabbit.
> **ly!have**: Takes colour and animal type or only animal and displays the amount of that combination you you or a user has.
> **ly!dismantle**: Takes color, animal, (and optionally) amount, and destroys them if you own them for 5 currency each.
> **ly!trade**: Trade system for animals and currency. See "ly!trade help" for details.`
export const execute = async (instance, message) => {
  try {
     await instance.client.users.send(message.author.id,
    MESSAGE
  ) 
  } catch(err) {
    if(CD[message.guild.id] && Date.now() - CD[message.guild.id] < 1000 * 60 * 2) {
       message.reply("I couldn't DM you. Make sure your DMs are open!").catch(console.error)
       return;
    }
    await message.reply(MESSAGE)
    CD[message.guild.id] = Date.now()
  }
}
