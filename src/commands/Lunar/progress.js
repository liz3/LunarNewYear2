import { EmbedBuilder } from "discord.js";
import {
  getGlobalBalance,
  getProgress,
} from "../../utils/balance.js";
import { capitalise } from "../../utils/funcs.js";

export const info = {
  name: "progress",
  aliases: ["balance", "bal", "$"],
  matchCase: false,
  category: "Lunar",
  help: {
    usage: "bal",
    examples: ["bal"],
    description: "Shows the progress on the event",
  },
};

export const execute = async (instance, message) => {
  const [claims, balance] = await Promise.all([
    getProgress(instance, message.author),
    getGlobalBalance(instance, message.author),
  ]);

  const progress = [`Your balance is ${balance}`];
  const claimsObj = claims.rows.reduce((acc, val) => {
    const k = `${val.animal}-${val.color}`;
    if (!acc[k]) {
      acc[k] = {
        name: `${capitalise(val.color)} ${capitalise(val.animal)}`,
        count: 1,
        k,
      };
    } else {
      acc[k].count += 1;
    }
    return acc;
  }, {});
  if (claimsObj["rabbit-white"]) {
    progress.push(
      `You own ${claimsObj["rabbit-white"].count} White  ${
        claimsObj["rabbit-white"].count === 1 ? "Rabbit" : "Rabbits"
      }!`
    );
  } else {
    progress.push(`You don't own any White Rabbits`);
  }
  const guildKey = "rabbit-" + instance.config.guilds[message.guild.id].color;
  const guildName = capitalise(instance.config.guilds[message.guild.id].color);
  if (claimsObj[guildKey]) {
    progress.push(
      `You own ${claimsObj[guildKey].count} ${guildName} ${
        claimsObj[guildKey].count === 1 ? "Rabbit" : "Rabbits"
      }!`
    );
  } else {
    progress.push(`You don't own any ${guildName} Rabbits`);
  }

  const claimsList = Object.values(claimsObj)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((e, i) => ({ name: e.name, value: `${e.count}` }));
  console.log(claimsList);
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Progress for ${message.author.tag}`,
      iconURL: message.author.avatarURL(),
    })
    .setDescription(
      progress.join("\n") +
        "\n\n> Collect them all from all the participating servers!"
    )
    .addFields(...claimsList)
    .setColor("#e0e0e0");
  await message.channel.send({ embeds: [embed] });
};
