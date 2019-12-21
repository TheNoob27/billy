const db = require("quick.db")
const { RichEmbed } = require("discord.js")

module.exports = (client, r, user) => {
  let message = r.message
  if (message.channel.type == "dm") return;
  if (message.guild.id != "648056524094046239") return;
  
  if (["🍆", "🍑", "🖕"].includes(r.emoji.name)) {
    r.remove(user)
    db.add(`badreactions_${user.id}`, 1)
    let infs =  db.fetch(`badreactions_${user.id}`)
    let embed = new RichEmbed()
    .setAuthor(user.tag, user.displayAvatarURL)
    .setTitle("Inappropriate Reaction")
    .setColor("#ff0000")
    .setDescription("**"+user.tag+"** reacted to [a message](https://discordapp.com/channels/"+message.guild.id+"/"+message.channel.id+"/"+message.id+") in <#"+message.channel.id+"> with the emoji "+r.emoji+"."+ (infs >= 3 ? "\n***This user has now been given the <@&648213925888000026> role as they have reacted with inappropriate reactions too many times. They can no longer add new reactions to messages.***": ""))
    .setFooter((3 - infs > 0 ? 3 - infs +" more times and they will be banned from adding reactions to messages." : "They are now banned from adding reactions to messages."))
    .setTimestamp()
    if (infs >= 3) message.guild.member(user).addRole("648213925888000026")
    user.send("That emoji is not allowed!" + (infs == 3 ? " You are now banned from adding reactions to messages." : ""))
    
    return client.channels.get("648199918632304671").send(embed)
  } else {
  if (message.id !== "648164452297867305") return;
  
  let member = message.guild.member(user)
  
  if (r.emoji == "⚔️" || "⚔️".includes(r.emoji.name)) {
    if (member.roles.has("648123633658626087")) return;
    member.addRole("648123633658626087")
    user.send("You have been given the Demon Farmer role.")
  } else if (r.emoji == "🎉" || "🎉".includes(r.emoji.name)) {
    if (member.roles.has("648156899509796871")) return;
    member.addRole("648156899509796871")
    user.send("You have been given the Giveaway Ping role.")
  }
  }

}