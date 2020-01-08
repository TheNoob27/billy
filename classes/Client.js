const { Client, Collection } = require("discord.js")
const { table } = require("quick.db")
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

class Billy extends Client {
  constructor() {
    super({
      disabledEvents: [
//      "READY",
//      "RESUMED",
        "GUILD_SYNC",
//      "GUILD_CREATE",
//      "GUILD_DELETE",
        "GUILD_UPDATE",
//      "GUILD_MEMBER_ADD",
        "GUILD_MEMBER_REMOVE",
//      "GUILD_MEMBER_UPDATE",
        "GUILD_MEMBERS_CHUNK",
        "GUILD_INTEGRATIONS_UPDATE",
        "GUILD_ROLE_CREATE",
        "GUILD_ROLE_DELETE",
        "GUILD_ROLE_UPDATE",
        "GUILD_BAN_ADD",
        "GUILD_BAN_REMOVE",
//      "CHANNEL_CREATE",
        "CHANNEL_DELETE",
        "CHANNEL_UPDATE",
        "CHANNEL_PINS_UPDATE",
//      "MESSAGE_CREATE",
        "MESSAGE_DELETE",
//      "MESSAGE_UPDATE",
        "MESSAGE_DELETE_BULK",
//      "MESSAGE_REACTION_ADD",
//      "MESSAGE_REACTION_REMOVE",
        "MESSAGE_REACTION_REMOVE_ALL",
        "USER_UPDATE",
        "USER_NOTE_UPDATE",
        "USER_SETTINGS_UPDATE",
        "PRESENCE_UPDATE",
        "VOICE_STATE_UPDATE",
        "TYPING_START",
        "VOICE_SERVER_UPDATE",
        "RELATIONSHIP_ADD",
        "RELATIONSHIP_REMOVE",
        "WEBHOOKS_UPDATE"
      ]
    })
    
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.traders = []
    
    this.db = new table("fob")
    this.fob = this.db
    this.config = require("../config.json")
    this.owner = this.config.owner
    
    this.loadCommands()
    this.loadEvents()
    
    this.gems = [
      "Mithril",
      "Demonite",
      "Fury Stone",
      "Spirit Shard",
      "Dragon Bone",
      "Red Diamond",
      "Grandidierite",
      "Poudretteite",
      "Benitoite",
      "Tanzanite",
      "Alexandrite",
      "Diamond",
      "Sapphire",
      "Ruby",
      "Lapis Lazuli",
      "Topaz",
      "Garnet",
      "Aquamarine",
      "Spinel",
      "Amber",
      "Titanite",
      "Tourmaline",
      "Kunzite",
      "Amethyst",
      "Citrine",
      "Peridot",
      "Iolite",
      "Onyx",
      "Turquoise",
      "Malachite",
      "Feldspar",
      "Jade",
      "Nephrite",
      "Olivine",
      "Copal"
  ]
    
    
    return this
  }
  
  toString() {
    return "Client [Billy]"
  }
  
  login() {
    return super.login(process.env.TOKEN)
  }
  
  
  async loadCommands() {
    const cmdFiles = await readdir("./commands/");
    
  console.log(`Loading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    let props = new (require(`../commands/${f}`))(this);
    this.commands.set(props.help.name, props);
	
    props.help.aliases.forEach(alias => this.aliases.set(alias, props.help.name))
    
  });
  console.log(`Loaded ${this.commands.size} commands and ${this.aliases.size} aliases`);
  }
  
  async loadEvents() {
    const evFiles = await readdir("./events/");
    
    evFiles.forEach(e => {
      let event = require(`../events/${e}`)
      
      super.on(e.split(".")[0], (...args) => event(this, ...args));
    })
    
    console.log("Loaded a total of "+evFiles.length+" events.")
  }
  
  
  addCooldown(id, time) {
      if (this.cooldowns.has(id)) return false;
      
    this.cooldowns.set(id, {
      id: id, 
      time: Date.now(),
      timer: setTimeout(() => {
        this.cooldowns.delete(id)
      }, time)
    })
    return true
  }
  
  deleteCooldown(type, id) {
    if (!this.cooldowns.has(id)) return false;
      
    clearTimeout(this.cooldowns.get(id).timer)
    this.cooldowns.delete(id)
    return true
  }
  
  
  resolveGem(input = "") {
    input = input.toLowerCase()
    
    let gem = {
      name: null,
      code: undefined,
      islegendary: false
    }
     
    
      for (var i in this.gems) {
        if (this.gems[i].toLowerCase() == input) gem.name = this.gems[i]
        else if (this.gems[i].split(" ")[0].toLowerCase() == input) gem.name = this.gems[i]
      }
    
    if (!gem.name) {
      if (input == "mith") gem.name = "Mithril"
      else if (input == "demo") gem.name = "Demonite"
      else if (input == "grand") gem.name = "Grandidierite"
      else if (input == "poud") gem.name = "Poudretteite"
      else if (input == "ben" || input == "beni") gem.name = "Benitoite"
      else if (input == "tanz") gem.name = "Tanzanite"
      else if (input == "aqua") gem.name = "Aquamarine"
    }
    
    if (!gem.name) return null;
    
    gem.code = gem.name.replace(/ /g, "").toLowerCase()
    
    if (["Mithril",
      "Demonite",
      "Fury Stone",
      "Spirit Shard",
      "Dragon Bone"].includes(gem.name)) gem.islegendary = true
    
    return gem
  }
  
  generateGem(legendaries = false, legendonly = false) {
    let gem = {
      name: null,
      code: undefined,
      islegendary: false
    }
    
    let legends = this.gems.slice(0, 5),
        rares = this.gems.slice(5, 9),
        uncommon = this.gems.slice(9, 14),
        common = this.gems.slice(14)

    
    if (legendonly) {
      gem.name = legends[Math.floor(Math.random() * legends.length)]
      gem.islegendary = true
      gem.code = gem.name.replace(/ /g, "").toLowerCase()
    
      return gem;
    }
 
    let gemchance = Math.random()
 
    if (legendaries) {
      if (gemchance > 0.95) {
     
      gem.name = legends[Math.floor(Math.random() * legends.length)] // 5% chance
      gem.islegendary = true
     
      } else if (gemchance > 0.85) gem.name = rares[Math.floor(Math.random() * rares.length)] // 10% chance
      else if (gemchance > 0.5) gem.name = uncommon[Math.floor(Math.random() * uncommon.length)] // 35% chance
      else gem.name = common[Math.floor(Math.random() * common.length)] // 50% chance
   
    } else {
      if (gemchance > 0.85) gem.name = rares[Math.floor(Math.random() * rares.length)] // 15% chance
      else if (gemchance > 0.5) gem.name = uncommon[Math.floor(Math.random() * uncommon.length)] // 35% chance
      else gem.name = common[Math.floor(Math.random() * common.length)]// 50% chance
    }
    gem.code = gem.name.replace(/ /g, "").toLowerCase()
    
    return gem
  }
}

module.exports = Billy