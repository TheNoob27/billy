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
        "GUILD_MEMBER_UPDATE",
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
    this.db = new table("fob")
    this.fob = this.db
    this.config = require("../config.json")
    this.owner = this.config.owner
    
    return this
  }
  
  toString() {
    return "Client [Starboard]"
  }
  
  login() {
    return super.login(process.env.TOKEN)
  }
  
  generateStar(stars) {
    let star = "⭐"
      if (stars > 29) star = "✨"
      else if (stars > 19) star = ""
      else if (stars > 9) star = ""
    
    return star
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
      
    this.cooldowns.ck.set(id, {
      id: id, 
      time: Date.now(),
      timer: setTimeout(() => {
        this.cooldowns.ck.delete(id)
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
  
  async getVoters() {
    this.voters = await this.votes.fetch("votes")
    console.log("Got all "+ this.voters.length +" voters!")
    return this.voters
  }
  
}

module.exports = Starboard