const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {
  try {
    message.delete()
  } catch(err) { }
let bug = {
  bug: "",
  how: "",
  effect: ""
}

//start refund request
bugname()

async function bugname() {
  let embed = new Discord.RichEmbed()
  .setTitle("New Bug Report")
  .setColor(colors.help)
  .setDescription("Thank you for submitting a bug report, fixing it helps everyone in game. \n**What is the bug?**")
  .setFooter("Didn't mean to send a bug report? Just say cancel to cancel.")
  let dm
  try {
    dm = await message.author.createDM()
    message.author.send(embed)   
  } catch(err) {
    return message.channel.send("Sorry, I could not send you a DM, and no bug report could be made.")
  }
  let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  let cancelled = false
  collector.on("collect", m => {
    if (m.content.toLowerCase() == "cancel") {
      cancelled = true
      collector.stop()
    }
    stopped = false
    bug.bug = m.content
    collector.stop()
  })
  
  collector.on("end", () => {
    if (cancelled) return message.author.send("Cancelled the refund request.")
    if (stopped) return message.author.send("You took too long to provide the bug.")
    
    how(dm)
  })
}

  function how(dm) {
    let embed = new Discord.RichEmbed()
  .setTitle("New Bug Report")
  .setColor(colors.help)
  .setDescription("**How was the bug caused/What caused the bug?** \n\n**Bug**: "+bug.bug)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  
  collector.on("collect", m => {
    stopped = false
    bug.how = m.content
    collector.stop()
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to provide an explanation.")
      
      effect(dm)
    })
  }
  
 function effect(dm) {
   let embed = new Discord.RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("**How does this affect the gameplay?** \n\n**Bug**: "+bug.bug +"\n**How It Is Done**: "+ bug.how)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  
  collector.on("collect", m => {
    stopped = false
    bug.effect = m.content
    collector.stop()
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to provide the effect on gameplay.")
      how(dm)
    })
 }
  
  function how(dm) {
    let embed = new Discord.RichEmbed()
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
    let embed = new Discord.RichEmbed()
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
    let embed = new Discord.RichEmbed()
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
      
      let embed = new Discord.RichEmbed()
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
module.exports.help = {
  name: "bugreport",
  aliases: ["bug", "reportbug"],
  description: "Submit a bug report.",
  usage: `b!bugreport`,
  category: "FOB"
}