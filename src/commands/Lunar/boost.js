import { EmbedBuilder } from "discord.js";
import { getGlobalBalance, addBalance } from "../../utils/balance.js";
import {
  getRandom,
  capitalise,
  generatePath,
  readImageFile,
  handleClaim,
} from "../../utils/funcs.js";

export const info = {
  name: "boost",
  aliases: [],
  matchCase: false,
  category: "Lunar",
  help: {
    usage: "boost",
    examples: ["boost"],
    description: "Use 50 currency to temporary boost a server",
  },
};

export const execute = async (instance, message) => {
  const balance = await getGlobalBalance(instance, message.author);

  if (balance < 50)
    return message.reply(`Not enough balance! (Your balance is ${balance})`);

  const currentBoost = await instance.redis.get(
    `guild_boost:user:${message.author.id}`
  );
  if (currentBoost) {
    const g = await instance.client.guilds.fetch(currentBoost);
    return message.reply(`You have a active boost for ${g.name}`);
  }
  const cd = await instance.redis.get(`guild_boost:cd:${message.author.id}`);
  if (cd) {
    const timeRemaining = Number.parseInt(cd) - Date.now();
    const mins = timeRemaining / 1000 / 60;
    return message.reply(
      `You are on boost cooldown, try again in ${mins.toFixed(0)} Minutes`
    );
  }
  const existingServerBoosts = await instance.redis.keys(
    `guild_boost:server:${message.guild.id}:*`
  );
  if (existingServerBoosts?.length === 5)
    return message.reply(`The server has reached the max amount of boosts!`);

  await Promise.all([
    instance.redis.setex(
      `guild_boost:user:${message.author.id}`,
      60 * 10,
      message.guild.id
    ),
    instance.redis.setex(
      `guild_boost:cd:${message.author.id}`,
      60 * 60 * 5,
      `${Date.now() + 1000 * 60 * 60 * 5}`
    ),
    instance.redis.setex(
      `guild_boost:server:${message.guild.id}:${message.author.id}`,
      60 * 10,
      "1"
    ),
    addBalance(instance, message.author, message.guild, -50, "boosting"),
  ]);
  return message.reply(`Successfully boosted ${message.guild.name} for 10 minutes increased server rabbit chance using ${(existingServerBoosts + 1)} boosts!`)
};
