const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {
  try {
    message.delete()
  } catch(err) { }
let bug = {
  bug: "",
  how: "",
  effect: "",
  extra: ""
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
  .setDescription("**What caused the bug?** \n\n**Bug**: "+bug.bug)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 180000})
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
  .setTitle("New Bug Report")
  .setColor(colors.help)
  .setDescription("**How does this affect the gameplay?** \n\n**Bug**: "+bug.bug +"\n**How It Is Done**: "+ bug.how)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 120000})
  let stopped = true
  
  collector.on("collect", m => {
    stopped = false
    bug.effect = m.content
    collector.stop()
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to provide the effect on gameplay.")
      end(dm)
    })
 }
  
  function extra(dm) {
   let embed = new Discord.RichEmbed()
  .setTitle("New Bug Report")
  .setColor(colors.help)
  .setDescription("**Do you have any images, evidence, or media that could help in any way?** If so, post **one** image/link. \n\n**Bug**: "+bug.bug +"\n**How It Is Done**: "+ bug.how)
  
    message.author.send(embed)
    
    let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  
  collector.on("collect", m => {
    stopped = false
    if (m.content.)
    bug.effect = m.content
    collector.stop()
  })
    
    collector.on("end", () => {
      if (stopped) return message.author.send("You took too long to provide the effect on gameplay.")
      end(dm)
    })
 }
  
  
  function end(dm) {
    let embed = new Discord.RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("**Are you happy with these results?** Yes or no. \n\n**Bug**: "+bug.bug +"\n**How It Is Done**: "+ bug.how + "\n**Effect On Gameplay**: "+bug.effect)
  
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
      .setTitle("Bug Report")
      .addField("Bug", bug.bug)
      .addField("How It Is Done", bug.how)
      .addField("Effect On Gameplay", bug.effect)
      .setColor(colors.color)
      
     client.channels.get("645316197478563840").send(embed)   
      return message.author.send("Bug report sent successfully!")
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