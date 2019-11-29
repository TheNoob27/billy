const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors, prefix, game) => {
if (!game && message.author.id != client.owner) return;
  
  function setup() {
    
  }
  
  function fight() {
    let enemy = {
      name: "Demon",
      hp: 1882
    }
    let hp = enemy.hp
    
    let embed = new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 8 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    
    message.channel.send(embed).then(async msg => {
      await msg.react("⚔️")
      
    let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.playerlist.includes(user.id)
    let collector = msg.createReactionCollector(filter, {time: 480000})
    let enemydied = false
    
    
    let updatedmg = setInterval(() => {
      //console.log(enemy.name + ": "+ enemy.hp)
      msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 8 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    )
    }, 1500)
    
    
    
    collector.on("collect", r => {
      let user = r.users.last()
      let player = game.players.find(p => p.id == user.id)
      if (Math.random() > 0.3) enemy.hp -= player.damage
      
      if (enemy.hp <= 0) {
        clearInterval(updatedmg)
        msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 8 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    )
        enemydied = true
        return collector.stop()
      }
      
      if (Math.random() > 0.5) {
        player.hp -= enemy.damage
      if (player.hp <= 0) {
        message.channel.send("**"+player.tag+"** died! T")
        for (var i = 0; i < game.playerlist.length; i++) {
          if (game.playerlist[i] == user.id) {
            game.playerlist.splice(i, 1)
            setTimeout(() => game.playerlist.push(user.id), 7000)
            break;
          }
        }
        
      }
      }
    })
      
      collector.on("end", () => {
        if (!enemydied) return message.channel.send("You automatically lose, because you took too long.")
        if (enemydied) message.channel.send("The Demon has been defeated!!! \n\nWait, it's raining... gems.")
       
        gems()
      })
    })
  }
  
  function gems() {
    
  }
}
module.exports.help = {
  name: "demon",
  aliases: [],
  description: "Summons the demon, can only be summoned after the play command.",
  usage: `b!demon`,
  category: "Secret"
}