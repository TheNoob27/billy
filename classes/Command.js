const { Collection } = require("discord.js")

class Command {
  constructor(client, options) {
    this.help = {
      name: options.name || null,
      aliases: options.aliases || [],
      description: options.description || "Not Set",
      usage: options.usage || "Not Set",
      category: options.category || "None",
      example: options.example || ""
    }
    
    this.settings = {
      cooldown: options.cooldown || 1000,
      cooldownmsg: options.cooldownmsg || "You're using this command too frequently! Please wait {time} before using it again." //" Voters only have half of all cooldowns."
    }
    
    this.cooldowns = new Collection()
    
    this.client = client
  }
  
  addCooldown(id) {
    this.cooldowns.set(id, {
      id: id, 
      time: Date.now(),
      timer: setTimeout(() => {
      this.cooldowns.delete(id)
    }, this.settings.cooldown) //this.client.voters.includes(id) ? this.settings.cooldown / 2 : this.settings.cooldown)
    })
  }
  
  sendCooldown(channel, id) {
    let msg = this.settings.cooldownmsg
    let cooldown = this.settings.cooldown//this.client.voters.includes(id) ? this.settings.cooldown / 2 : this.settings.cooldown
    msg = msg.replace(/{time}/g, require("pretty-ms")(cooldown - (Date.now() - this.cooldowns.get(id).time) ))
    
    channel.send(msg)
  }
  
  deleteCooldown(id) {
    if (!this.cooldowns.has(id)) return false;
    
    clearTimeout(this.cooldowns.get(id).timer)
    this.cooldowns.delete(id)
    return true
  }
  
  
}

module.exports = Command