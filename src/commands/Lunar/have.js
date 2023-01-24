import { EmbedBuilder } from "discord.js";
import { getGlobalBalance, addBalance } from "../../utils/balance.js";
import { capitalise, readImageFile, generatePath } from "../../utils/funcs.js";

export const info = {
  name: "have",
  aliases: ["h"],
  matchCase: false,
  category: "Lunar",
  help: {
    usage: "have <color> <animal> or have <animal> or have @user <...>",
    examples: ["have snake"],
    description: "Check if you have a certain animal!",
  },
};

export const execute = async (instance, message, args) => {
  if (args.length < 1)
    return message.reply(`Not enough args! \`${info.help.usage}\``);

  const target = message.mentions.users.first() || message.author;
  if (message.mentions.users.size) args.shift();
  const [firstArg, secondArg] = args;
  const allAnimals = instance.config.animals;
  const allColors = [
    ...instance.config.colors,
    ...Object.values(instance.config.guilds).map((g) => g.color),
  ];
  const color =
    args.length === 2
      ? allColors.find((c) => c.toLowerCase() === firstArg.toLowerCase())
      : null;
  const animal = allAnimals.find(
    (c) =>
      c.toLowerCase() ===
      (args.length === 2 ? secondArg : firstArg).toLowerCase()
  );

  if (!color && args.length === 2)
    return message.reply("The specified color does not exist!");
  if (!animal) return message.reply("The specified animal does not exist!");

  const { rows } =
    args.length === 2
      ? await instance.db.pool.query(
          "SELECT COUNT(id) as total FROM CLAIMS WHERE user_id=$1 AND animal=$2 AND color=$3",
          [target.id, animal, color]
        )
      : await instance.db.pool.query(
          "SELECT * FROM CLAIMS WHERE user_id=$1 AND animal=$2",
          [target.id, animal]
        );

  if (args.length === 2) {
    const [{ total: existing }] = rows;
    const file = await readImageFile(generatePath(animal, color));
    const embed = new EmbedBuilder()
      .setTitle(
        `${target.tag} has ${existing} ${capitalise(color)} ${capitalise(
          animal
        )}!`
      )
      .setThumbnail("attachment://image.png")
      .setColor(instance.config.hex_codes[color]);
    return message.reply({
      embeds: [embed],
      files: [{ attachment: file, name: "image.png" }],
    });
  } else {
    const entries = rows.reduce((acc, val) => {
      if (!acc[val.color]) acc[val.color] = { color: val.color, count: 0 };
      acc[val.color].count += 1;
      return acc;
    }, {});
    const sorted = Object.values(entries).map((a, b) => b.count - a.count);
    const total = sorted.reduce((acc, val) => acc + val.count, 0);
    const embed = new EmbedBuilder();
    if (sorted.length) {
      const file = await readImageFile(generatePath(animal, sorted[0].color));
      embed
        .setTitle(`${target.tag} has ${total} ${capitalise(animal)}!`)
        .setThumbnail("attachment://image.png")
        .setColor(instance.config.hex_codes[sorted[0].color])
        .setDescription(
          sorted.map((e) => `**${capitalise(e.color)}**: ${e.count}`).join("\n")
        );
      return message.reply({
        embeds: [embed],
        files: [{ attachment: file, name: "image.png" }],
      });
    } else {
      embed
        .setTitle(`${target.tag} has 0 ${capitalise(animal)}!`)
        .setColor("White");
      return message.reply({
        embeds: [embed],
      });
    }
  }
};
