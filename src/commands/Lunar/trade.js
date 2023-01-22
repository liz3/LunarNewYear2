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
  name: "trade",
  aliases: ["t"],
  matchCase: false,
  category: "Lunar",
  help: {
    usage: "trade @User",
    examples: ["trade @Alycans"],
    description: "Trade animals currency with a user",
  },
};

/* states
0 = pending
1 = started
2 = confirming
3 = finished
*/
const state = {};
const failed_trades = {};

const findTrade = (id) =>
  Object.values(state).find(
    (trade) => (trade.s_id === id || trade.t_id === id)
  );

const format = (me, them) => {
  const lines = ["Your offer:", `${me.c} currency`];
  for (const entry of Object.values(me.a)) {
    lines.push(
      `- ${capitalise(entry.color)} ${capitalise(entry.animal)}: ${
        entry.amount
      }`
    );
  }
  lines.push("\n");
  lines.push("Their offer");
  lines.push(`${them.c} currency`);
  for (const entry of Object.values(them.a)) {
    lines.push(
      `- ${capitalise(entry.color)} ${capitalise(entry.animal)}: ${
        entry.amount
      }`
    );
  }
  return lines.join("\n");
};

const state_str = {
  1: "Running",
  2: "Awaiting confirmation",
};

const doExchange = async (instance, g, s, t) => {
  const list = [];
  if (s.c > 0) {
    const balance = await getGlobalBalance(instance, s.u);
    if (balance < s.c) return [false, list];
    await Promise.all([
      addBalance(instance, s.u, g, -s.c, `-${s.c} Trade with ${t.u.id}`),
      addBalance(instance, t.u, g, s.c, `${s.c} Trade with ${s.u.id}`),
    ]);

    list.push(async () => {
      await Promise.all([
        addBalance(
          instance,
          s.u,
          g,
          s.c,
          `-${s.c} Trade revert with ${t.u.id}`
        ),
        addBalance(instance, t.u, g, -s.c, `${s.c} Trade with ${s.u.id}`),
      ]);
    });
  }
  for (const entry of Object.values(s.a)) {
    const { rows: entries } = await instance.db.pool.query(
      "SELECT * FROM CLAIMS WHERE user_id=$1 AND animal=$2 AND color=$3 LIMIT $4",
      [s.u.id, entry.animal, entry.color, entry.amount]
    );
    if (entries.length !== entry.amount) return [false, list];
    await Promise.all(
      entries.map((row) =>
        instance.db.simpleUpdate("CLAIMS", { id: row.id }, { user_id: t.u.id })
      )
    );
    const ids = entries.map((e) => e.id);
    list.push(async () => {
      await Promise.all(
        ids.map((id) =>
          instance.db.simpleUpdate("CLAIMS", { id: id }, { user_id: s.u.id })
        )
      );
    });
  }
  return [true, list];
};
const getMe = (trade, id) =>
  trade.s_id === id ? trade.s_trade : trade.t_trade;
const getOther = (trade, id) =>
  trade.s_id === id ? trade.t_trade : trade.s_trade;

const HELP = {
  start: "ly!trade @targetuser",
  accept: "ly!trade accept",
  cancel: "ly!trade cancel",
  currency: "ly!trade currency 25",
  set: "ly!trade add blue dragon 1",
  remove: "ly!trade remove red monkey 1",
  status: "ly!trade status",
  confirm: "ly!trade confirm",
};

const ACTIONS = {
  start: async (instance, message) => {
    const tradeExists = findTrade(message.author.id);
    if (tradeExists) {
      if(tradeExists.state !== 0)
       return [false, "Already in a trade"];
     delete state[tradeExists.key]
    }

    if (
      failed_trades[message.author.id] &&
      Date.now() - failed_trades[message.author.id] < 1000 * 60 * 45
    )
      return [
        false,
        "You had a recently failed trade, please wait before retrying",
      ];
    else delete failed_trades[message.author.id];
    if (message.mentions.users.size !== 1)
      return [false, "Wrong argument count"];
    const targetUser = message.mentions.users.first();
    if(targetUser.id === message.author.id)
      return [true, "HUH"]
    const otherTrade = findTrade(targetUser.id);
    if (otherTrade) return [false, "Other user is currently in trade"];
    if (
      failed_trades[targetUser.id] &&
      Date.now() - failed_trades[targetUser.id] < 1000 * 60 * 45
    )
      return [false, "That user cannot accept trades at the momment"];
    else delete failed_trades[targetUser.id];

    const k = message.author.id + "-" + targetUser.id;
    state[k] = {
      key: k,
      started: Date.now(),
      s_id: message.author.id,
      t_id: targetUser.id,
      state: 0,
      s_trade: {
        c: 0,
        a: {},
        accepted: false,
        u: message.author,
      },
      t_trade: {
        c: 0,
        a: {},
        accepted: false,
        u: targetUser,
      },
    };
    return [true, "Awaiting confirmation"];
  },
  accept: async (instance, message) => {
    const trade = findTrade(message.author.id)
    if (!trade) {
      return [false, "Trade not found"];
    }
    if (trade.state !== 0) return [false, "Trade is not pending"];
    if(Date.now()-trade.started > 1000 * 6 * 3) {
      delete state[trade.key]
      return [false, "Was pending for 3 minutes, trade request cancelled, ask them for another trade."]
    }
    trade.state = 1;
    return [true, "Trade started"];
  },
  cancel: async (instance, message) => {
    const trade = findTrade(message.author.id);
    if (!trade || trade.state === 0 || trade.state === 3)
      return [false, "Not Found"];
    failed_trades[trade.s_trade.u.id] = Date.now();
    failed_trades[trade.t_trade.u.id] = Date.now();
    delete state[trade.key];
    return [true, "Cancelled"];
  },
  currency: async (instance, message, args) => {
    const trade = findTrade(message.author.id);
    if (!trade || trade.state !== 1) return [false, "Trade not found"];

    if (args.length !== 1)
      return [
        false,
        "Not enough arguments, need first argument with number to offer",
      ];
    const n = Number.parseInt(args[0]);
    if (Number.isNaN(n) || n <= 0) return [false, "Invalid curreny amount"];
    const me = getMe(trade, message.author.id);
    const balance = await getGlobalBalance(instance, message.author);
    if (balance < n) return [false, "You dont have so much to offer"];
    me.c = n;
    return [true, "Set Offer Amount"];
  },
  set: async (instance, message, args) => {
    const trade = findTrade(message.author.id);
    if (!trade || trade.state !== 1) return [false, "Trade not found"];

    if (args.length !== 3)
      return [
        false,
        "Not enough arguments, need color, animal and then amount",
      ];

    const [colorProvided, animalProvided, amountProvided] = args;

    const allAnimals = instance.config.animals;
    const allColors = [
      ...instance.config.colors,
      ...Object.values(instance.config.guilds).map((g) => g.color),
    ];
    const color = allColors.find(
      (c) => c.toLowerCase() === colorProvided.toLowerCase()
    );
    const animal = allAnimals.find(
      (c) => c.toLowerCase() === animalProvided.toLowerCase()
    );
    const amount = Number.parseInt(amountProvided);
    if (!color) return [false, "This color does not exist"];
    if (!animal) return [false, "This animal does not exist"];
    if (Number.isNaN(amount) || amount <= 0) return [false, "Invalid amount"];
    const {
      rows: [{ total: existing }],
    } = await instance.db.pool.query(
      "SELECT COUNT(id) as total FROM CLAIMS WHERE user_id=$1 AND animal=$2 AND color=$3",
      [message.author.id, animal, color]
    );
    if (existing < amount)
      return [false, "You dont have enough of this combination"];

    const me = getMe(trade, message.author.id);
    me.a[`${animal}-${color}`] = {
      animal,
      color,
      amount,
    };
    return [true, "Updated offer"];
  },
  remove: async (instance, message, args) => {
    const trade = findTrade(message.author.id);
    if (!trade || trade.state !== 1) return [false, "Trade not found"];
    if (args.length !== 2)
      return [false, "Not enough arguments, need color and animal"];
    const [colorProvided, animalProvided] = args;
    const allAnimals = instance.config.animals;
    const allColors = [
      ...instance.config.colors,
      ...Object.values(instance.config.guilds).map((g) => g.color),
    ];
    const color = allColors.find(
      (c) => c.toLowerCase() === colorProvided.toLowerCase()
    );
    const animal = allAnimals.find(
      (c) => c.toLowerCase() === animalProvided.toLowerCase()
    );

    const me = getMe(trade, message.author.id);
    const k = `${animal}-${color}`;
    if (!me.a[k]) return [false, "You didnt offer any of that combination"];
    delete me.a[k];

    return [true, "Updated offer"];
  },
  status: async (instance, message, args) => {
    const trade = findTrade(message.author.id);
    if (!trade || trade.state === 0) return [false, "Trade not found"];
    const me = getMe(trade, message.author.id);
    const them = getOther(trade, message.author.id);

    const formatted = format(me, them);

    const targetMessage = `Your Trade with ${them.u.tag}:\n${formatted}`;

    return [true, targetMessage];
  },
  confirm: async (instance, message, args) => {
    const trade = findTrade(message.author.id);
    if (!trade || trade.state === 0) return [false, "Trade not found"];

    trade.state = 2;
    const me = getMe(trade, message.author.id);
    if(me.accepted)
      return [false, "You already confirmed"]
    me.accepted = true;
    const them = getOther(trade, message.author.id);
    if (them.accepted) {
      trade.state = 3;
      const [s1, l1] = await doExchange(
        instance,
        message.guild,
        trade.s_trade,
        trade.t_trade
      );
      if (!s1) {
        await Promise.all(l1.map((e) => e()));
        delete state[trade.key];
        failed_trades[me.u.id] = Date.now();
        failed_trades[them.u.id] = Date.now();
        return [false, "Trade failed, rolling back"];
      }
      const [s2, l2] = await doExchange(
        instance,
        message.guild,
        trade.t_trade,
        trade.s_trade
      );

      if (!s2) {
        await Promise.all(l2.map((e) => e()));
        await Promise.all(l1.map((e) => e()));
        delete state[trade.key];
        failed_trades[me.u.id] = Date.now();
        failed_trades[them.u.id] = Date.now();
        return [false, "Trade failed, rolling back"];
      }
      delete state[trade.key];

    const formatted = format(me, them);

    const targetMessage = `<@${me.u.id}>Trade with <@${them.u.id}> Succeeded:\n${formatted}`;

      return [true, targetMessage];
    } else {
      return [true, "Awaiting confirmation from them."]
    }
  },
};

export const execute = async (instance, message, args) => {
  const action = args.shift();
  if (action === "help" || !action)
    return message.reply(
      Object.entries(HELP)
        .map((e) => `${e[0]}: ${e[1]}`)
        .join("\n")
    );

  if (ACTIONS[action.toLowerCase()]) {
    const [r, result] = await ACTIONS[action.toLowerCase()](
      instance,
      message,
      args
    );
    return message.reply(`${r ? "" : "Error: "}${result}`);
  } else {
    const [r, result] = await ACTIONS.start(instance, message, args);
    return message.reply(`${r ? "" : "Error: "}${result}`);
  }
};
