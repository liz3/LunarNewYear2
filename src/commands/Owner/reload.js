export const info = {
  name: "reload",
  matchCase: false,
  category: "Owner",
  ownerOnly: true,
  help: {
    usage: "reload",
    examples: ["reload"],
    description: "Nuclear option! You know, can end wrong and all!",
  },
};

export const execute = async (instance, message) => {
  if (message.author.id !== "175408504427905025" && message.author.id !== "195906408561115137") return;
  const msg = message.channel.send("> // System Reloading //");
  await instance.initReload();
  await (await msg).edit("_Reload complete._");
};
