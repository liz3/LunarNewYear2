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
    '848127260892725268': { name: 'Wat', color: 'Golden', invite: 'https://www.comfy.gay/appeal', private: true },
    '1064798672182853653': { name: 'liz3dev', color: 'Golden', invite: 'https://www.comfy.gay/appeal', private: true },
    '931104933892194364': { name: 'G&C Staff Server', color: 'ComfyGay', invite: 'https://discord.gg/comfy', whitelist: ["1066084899334930472"], private: true },
    '378599231583289346': { name: 'Gay & Comfy', color: 'ComfyGay', invite: 'https://discord.gg/comfy', whitelist: ["931993953811718235"] },
    "637683844988010546": { name: "Reiko's CyberCafe", color: "Reiko", invite: "https://discord.gg/happy", whitelist: ["640335781973458977"] },
    "708357722822672524": { name: "Yuri's Anime Zone", color: "YuriZone", invite: "https://discord.gg/yuri", whitelist: ["708357723292565516"] },
    "417702211284500482": { name: "Lost in Potato", color: "Potato", invite: "https://discord.gg/tato", whitelist: ["417863870732828672"] },
    "856951924879523871": { name: "The TeaHouse", color: "TeaHouse", invite: "https://discord.gg/sip",  whitelist: ["856959765992308747"] },
    "683075970206531618": { name: "Paradise Isle", color: "Paradise", invite: "https://discord.gg/hot", whitelist: ["750956484111892510"] },
    "519427807814615042": { name: "The X Zone", color: "Exzy", invite: "https://discord.gg/xzone", whitelist: ["888518637676269568", "1027766212320559155"], colorChance: 0.55 },
    "298954459172700181": { name: "Animekos", color: "Animekos", invite: "https://discord.gg/animekos", whitelist: ["298954459172700181", "298955020232032258"], colorChance: 0.55 },
    "424447023765520386": { name: "Blossom Empire", color: "Blossom", invite: "https://discord.gg.join", whitelist: ["575824180126416901"], colorChance: 0.55 },
  },
  animals: [
    'rat', 'ox', 'tiger', 'rabbit',
    'dragon', 'snake', 'horse', 'goat',
    'monkey', 'rooster', 'dog', 'pig'
  ],
  colors: ["blue", "green", "orange", "red", "violet", "yellow", "white"],
  hex_codes: {
      white: "#FFFFFF",
      //guild colors
      YuriZone: "#1D94AF",
      Potato: "#f09b96",
      ComfyGay: "#D377BA",
      Reiko: "#D81BDA",
      TeaHouse: "#4e649a",
      Paradise: "#D9C33F",
      Golden: "#D3AE46",
      Exzy: "#FF7199",
      Animekos: "#FFB16E",
      Blossom: "#EF488C",
      //normal
      blue: "#1555AC",
      green: "#31A82E",
      orange: "#D3581E",
      red: "#AE0100",
      violet: "#48199D",
      yellow: "#F7BD1B"
  },
  rabbit_colors: ["white"],
  chances_highroll:  [[0.7, ["rat", "ox", "tiger", "snake", "horse", "monkey", "dog", "goat", "rooster"]], [0.75,["pig"]], [0.80, ["dragon"]], [0.9,["rabbit"]]],
  chances_animals: [[0.6, ["rat", "ox", "tiger", "snake", "horse", "monkey", "dog", "goat", "rooster"]], [0.90,["pig"]], [0.95, ["dragon"]]],
  chance_rabbit:  [0.98, ["rabbit"]],
  chances_color: [[0.2, ["blue", "green", "orange", "red", "violet", "yellow"]]],
  chance_white:  [0.991, ["white"]]
}
config.guildIds = Object.keys(config.guilds)

export default config
