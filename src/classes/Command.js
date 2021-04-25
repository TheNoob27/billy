const { Collection } = require("discord.js")
const Toggle = require("./Toggle")
const ms = require("pretty-ms")

class Command extends Toggle {
  constructor(client, options = {}) {
    super()

    /** @type {import("./Client")} */
    this.client
    Object.defineProperty(this, "client", { value: client })
    
    this.name = options.name || null,
    this.aliases = options.aliases || [],
    this.description = options.description || "Not Set",
    this.usage = options.usage || "Not Set",
    this.category = options.category || "None",
    this.example = options.example || ""
    
    this.cooldown = options.cooldown || 1000,
    this.cooldownmsg = options.cooldownmsg || `You're using this command too frequently! Please wait {time} before using it again.${this.client.voters ? " Voters have their cooldown times cut in half." : ""}`,
    this.errorMessage = null,
    this.disableMessage = null,
    this.lowerCaseArgs = typeof options.lowerCaseArgs === "number" ? [options.lowerCaseArgs] : options.lowerCaseArgs || false,
    this.owner = Boolean(options.owner),
    this.requiredPermissions = options.requiredPermissions || [],
    this.botPerms = options.botPerms || []
    
    this.cooldowns = new Collection()
  }
  
  addCooldown(id) {
    return this.cooldowns.set(id, {
      id,
      time: Date.now(),
      timer: setTimeout(() => {
        this.cooldowns.delete(id)
      }, this.client.voters && this.client.voters.includes(id) ? this.cooldown / 2 : this.cooldown)
    })
  }
  
  deleteCooldown(id) {
    if (!this.cooldowns.has(id)) return false;

    clearTimeout(this.cooldowns.get(id).timer)
    this.cooldowns.delete(id)
    return true
  }
  
  disable(reason) {
    if (reason && typeof reason === "string") this.disableMessage = reason
    return super.disable()
  }
  
  getHelp(prefix = this.client.config.prefix) {
    return new Embed()
    .setTitle("Help")
    .setColor(this.enabled ? this.client.colors.help : this.client.colors.error)
    .addField(`Command: ${prefix}${this.name}`, `**Aliases**: ${this.aliases.join(", ") || "Not set"} \n**Description**: ${this.description} \n**Usage**: ${this.usage.replace(this.client.config.prefix, prefix)} \n${this.example ? `**Example${this.example.includes("\n") ? "s" : ""}**: ${this.example instanceof Array ? this.example.random().replace(this.client.config.prefix, prefix) : this.example.replace(this.client.config.prefix, prefix)}` : ""}`)
    .addField("Extra", `**Category**: ${this.category} \n**Cooldown**: ${ms(this.cooldown)} \n**Enabled**: ${this.enabled ? "Yes" : "No"}`)
    .addField("Notices", this.notices ? (this.errorMessage ? "Something is currently wrong with this command: **" + this.errorMessage + "**.\n" : "") + (this.disableMessage ? "This command is disabled: **" + this.disableMessage + "**" : "") : "None")
    .setFooter("() = optional, <> = required.")
  }
  
  reload() {
    delete require.cache[require.resolve(`../commands/${this.name}.js`)]
    let newcmd = new (require(`../commands/${this.name}.js`))(this.client)
    
    if (this.name !== newcmd.name) this.client.commands.delete(this.name)
    this.client.commands.set(newcmd.name, newcmd)
    return this
  }

  sendToAuthor(message, ...data) {
    return message.author.send(...data).catch(() => message.channel.send(...data))
  }

  sendCooldown(channel, id) {
    return channel.send(`You're on a cooldown! Please wait ${ms(this.cooldown - (Date.now() - this.cooldowns.get(id).time))} before trying again.`)
  }

  toString() {
    return this.name
  }
  
  run() {
    return Promise.reject("No run function defined for command " + this.name)
  }
}

module.exports = Command
