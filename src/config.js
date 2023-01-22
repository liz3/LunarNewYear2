import { GatewayIntentBits } from 'discord.js'

const config = {
  prefix: 'ly!',
  database: {
    host: "database",
    user: "lny",
    database: "lny",
    port: 5432,
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],

  staffGuild: '931104933892194364',
  guilds: {
    // todo change for participating ones
    '1064798672182853653': { name: 'Wat', color: 'golden', invite: 'https://www.comfy.gay/appeal', private: true },
    '378599231583289346': { name: 'Gay & Comfy', color: 'ComfyGay', invite: 'https://discord.gg/comfy', whitelist: ["931993953811718235"] },
    '931104933892194364': { name: 'Gay & Comfy 2', color: 'ComfyGay', invite: 'https://discord.gg/comfy', whitelist: [], private: true},
    "637683844988010546": {name: "Reiko's CyberCafe", color: "Reiko", invite: "https://discord.gg/happy", whitelist: ["640335781973458977"]},
    "708357722822672524": {name: "Yuri's Anime Zone", color: "YuriZone", invite: "https://discord.gg/yuri", whitelist: []},
    "417702211284500482": {name: "Lost in Potato", color: "Potato", invite: "https://discord.gg/tato", whitelist: ["417863870732828672"]},
    "856951924879523871": {name: "The TeaHouse", color: "TeaHouse", invite: "https://discord.gg/sip",  whitelist: []},
    "683075970206531618": { name: "Paradise Isle", color: "Paradise", invite: "https://discord.gg/hot", whitelist: ["750956484111892510"]}
  },
  animals: [
    'rat', 'ox', 'tiger', 'rabbit',
    'dragon', 'snake', 'horse', "goat",
    'monkey', 'rooster', 'dog', 'pig'
  ],
  colors: ["blue", "green", "orange", "red", "violet", "yellow"],
  hex_codes: {
      white: "#FFFFFF",
      //guild colors
      YuriZone: "#1D94AF",
      Potato: "#f09b96",
      ComfyGay: "#D377BA",
      Reiko: "#D81BDA",
      TeaHouse: "#4e649a",
      Paradise: "#D9C33F",
      golden: "#D3AE46",
      //normal
      blue: "#1555AC",
      green: "#31A82E",
      orange: "#D3581E",
      red: "#AE0100",
      violet: "#48199D",
      yellow: "#F7BD1B"
  },
  rabbit_colors: ["white"],
  chances_animals: [[0.9, ["rat", "ox", "tiger", "snake", "horse", "monkey", "dog", "goat"]], [0.90,["pig"]], [0.98, ["dragon"]]],
  chance_rabbit:  [0.996, ["rabbit"]],
  chances_color: [[0.9, ["blue", "green", "orange", "red", "violet", "yellow"]]],
  chance_white:  [0.999, ["white"]]
}
config.guildIds = Object.keys(config.guilds)

export default config
