import { GatewayIntentBits } from 'discord.js'

const config = {
  prefix: '-',
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
    '378599231583289346': { name: 'Gay & Comfy', color: 'golden', invite: 'https://discord.gg/comfy' },
    '1064798672182853653': { name: 'Wat', color: 'cyan', invite: 'https://www.comfy.gay/appeal' },
    "637683844988010546": {name: "Reiko's CyberCafe", color: "pink", invite: "https://discord.gg/happy"}
  },
  animals: [
    'rat', 'ox', 'tiger', 'rabbit',
    'dragon', 'snake', 'horse', 'sheep',
    'monkey', 'rooster', 'dog', 'pig'
  ],
  colors: ["blue", "green", "orange", "red", "violet", "yellow"],
  hex_codes: {
      white: "#FFFFFF",
      //guild colors
      cyan: "#1D94AF",
      gold: "#D3AE46",
      //normal
      blue: "#1555AC",
      green: "#31A82E",
      orange: "#D3581E",
      red: "#AE0100",
      violet: "#48199D",
      yellow: "#F7BD1B"
  },
  rabbit_colors: ["white"],
  chances_animals: [[0.9, ["rat", "ox", "tiger", "snake", "horse", "monkey", "dog"]], [0.90,["pig"]], [0.98, ["dragon"]],  [0.996, ["rabbit"]]],
  chances_color: [[0.9, ["blue", "green", "orange", "red", "violet", "yellow"]]],
  chance_white:  [0.999, ["white"]]
}
config.guildIds = Object.keys(config.guilds)

export default config
