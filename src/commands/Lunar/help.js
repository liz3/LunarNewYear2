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
  await message.reply(
    `> **Welcome to Lunar New Year 2023: Year of the Rabbit!**
> This bot spawns animals of different colours whenever someone sends a message, with a cooldown of 60 seconds, and a random chance.
> You claim the animal by reacting to the message. The first person to react, gets the animal plus 5 currency. Everyone else gets 1 currency.
> *This event is running until February 5th, 2023!*

> **Check out <https://comfy.gay/#lunarevent> to know how to play!**`
  )
}
