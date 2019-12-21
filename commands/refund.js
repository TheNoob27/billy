const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class Refund extends Command {
  constructor(client) {
    super(client, {
      name: "refund",
      aliases: [],
      description: "Submit a refund request.",
      usage: `b!refund`,
      category: "Info",
      cooldown: 120000,
      cooldownmsg: "You can request another refund in {time}."
    })
  }
  
  async run(client, message, args, colors) {
  try {
    message.delete()
  } catch(err) { }
let refund = {
  username: "",
  date: "",
  item: "",
  how: "",
  additional: ""
}

//start refund request
username()

async function username() {
  let embed = new RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("Your refund request will be sent, but first supply some information. \n**What is the username of the ROBLOX account that lost the item?**")
  .setFooter("Didn't mean to send a refund request? Just say cancel to cancel.")
  let dm
  try {
    dm = await message.author.createDM()
    message.author.send(embed)   
  } catch(err) {
    return message.channel.send("Sorry, I could not send you a DM, and no refund request could be made.")
  }
  let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  let cancelled = false
  collector.on("collect", m => {
    if (m.content.length > 20) return m.author.send("A valid username isn't longer than 20 characters.")
    if (m.content.length < 3) return m.author.send("A valid username isn't shorter than 3 characters.")
    if (m.content.includes(" ")) return m.author.send("A valid username doesn't include spaces.")
    if (m.content.toLowerCase() == "cancel") {
      cancelled = true
      collector.stop()
    }
    stopped = false
    refund.username = m.content
    collector.stop()
  })
  
  collector.on("end", () => {
    if (cancelled) return message.author.send("Cancelled the refund request.")
    if (stopped) return message.author.send("You took too long to provide a valid username.")
    
    date(dm)
  })
}

  function date(dm) {
    let embed = new RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("**When did you lose this item?** \n\n**Username**: "+refund.username)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  
  collector.on("collect", m => {
    stopped = false
    refund.date = m.content
    collector.stop()
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to provide a date.")
      
      item(dm)
    })
  }
  
 function item(dm) {
   let embed = new RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("**What did you lose?** \n\n**Username**: "+refund.username +"\n**Date Of Loss**: "+ refund.date)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  
  collector.on("collect", m => {
    stopped = false
    refund.item = m.content
    collector.stop()
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to provide the item you lost.")
      how(dm)
    })
 }
  
  function how(dm) {
    let embed = new RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("**How did you lose this item?** \n\n**Username**: "+refund.username +"\n**Date Of Loss**: "+ refund.date + "\n**Item Lost**: "+refund.item)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 120000})
  let stopped = true
  
  collector.on("collect", m => {
    stopped = false
    refund.how = m.content
    collector.stop()
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to provide how you lost the item.")
      
      additional(dm)
    })
  }
  
  function additional(dm) {
    let embed = new RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("**Any additional details that would help?** If not, just say `no` or `none`. \n\n**Username**: "+refund.username +"\n**Date Of Loss**: "+ refund.date + "\n**Item Lost**: "+refund.item + "\n**How The Item Was Lost**: "+refund.how)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 180000})
  let stopped = true
  collector.on("collect", m => {
    stopped = false
    if (m.content.toLowerCase() == "no" || m.content.toLowerCase() == "none") {
      refund.additional = "None"
      collector.stop()
    } else {
    refund.additional = m.content
    collector.stop()
    }
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to provide if you had additional details.")
      
      end(dm)
    })
  }
  
  
  function end(dm) {
    let embed = new RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("**Are you happy with these results?** Yes or no. \n\n**Username**: "+refund.username +"\n**Date Of Loss**: "+ refund.date + "\n**Item Lost**: "+refund.item + "\n**How The Item Was Lost**: "+refund.how+"\n**Additional Details**: "+refund.additional)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id && (m.content.toLowerCase() == "yes" || m.content.toLowerCase() == "no")
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  let happy = false
  
  collector.on("collect", m => {
    stopped = false
    if (m.content.toLowerCase() == "no") {
      collector.stop()
    } else {
    happy = true
    collector.stop()
    }
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to specify if you were happy or not, so the refund was not posted.")
      if (!happy) return message.author.send("Refund request cancelled, nothing was submitted.")
      
      let embed = new RichEmbed()
      .setTitle("Refund Request")
      .addField("Username", refund.username)
      .addField("Date Of Loss", refund.date)
      .addField("Item Lost", refund.item)
      .addField("How The Item Was Lost", refund.how)
      .addField("Additional Details", refund.additional)
      .setColor(colors.color)
      
     client.channels.get("645316197478563840").send(embed)   
      return message.author.send("Refund request sent successfully!")
    })
  }
  
}
}

module.exports = Refund