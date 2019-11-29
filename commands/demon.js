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
    .addField("Giant Demon Spawn", "A GIANT ")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    
    message.channel.send(embed).then(async msg => {
      await msg.react("⚔️")
      
    let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.playerlist.includes(user.id)
    let collector = msg.createReactionCollector(filter, {time: 120000})
    let alldied = false
    let enemydied = false
    let helped = []
    
    
    let updatedmg = setInterval(() => {
      //console.log(enemy.name + ": "+ enemy.hp)
      msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him. You have 2 minutes.")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
    .setColor(colors.color)
    )
    }, 2000)
    
    
    
    collector.on("collect", r => {
      let user = r.users.last()
      let player = game.players.find(p => p.id == user.id)
      enemy.hp -= player.damage
      if (!helped.includes(user.id)) helped.push(user.id)
      
      if (enemy.hp <= 0) {
        clearInterval(updatedmg)
        msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him.")
    .addField("Enemy's HP", "0/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
    .setColor(colors.color)
    )
        enemydied = true
        return collector.stop()
      }
      
      if (Math.random() > 0.5) {
        player.hp -= enemy.damage
      if (player.hp <= 0) {
        message.channel.send("**"+player.tag+"** died!")
        for (var i = 0; i < game.players.length; i++) {
          if (game.players[i].id == user.id) {
            game.players.splice(i, 1)
            game.playerlist.splice(i, 1)
          }
        }
        
        if (game.players.length < 1) {
          clearInterval(updatedmg)
          
          msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him.")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
    .setColor(colors.color)
    )
          
          alldied = true
          return collector.stop() //message.channel.send("Everyone died!")
        }
      }
      }
    })
      
      collector.on("end", () => {
        enemycount += 1
        
        if (alldied) return end(game, true)
        if (!alldied && !enemydied) return message.channel.send("You automatically lose, because you took too long.")
        if (enemydied) message.channel.send("Yay, the "+enemy.name+" died!")
        
        for (var i = 0; i < helped.length; i++) {
          if (game.playerlist.includes(helped[i])) {
            if (Math.random() > .5) {
            let gem = getgem()
            if (gem.name && gem.code) {
              client.fob.add(`${helped[i]}.inventory.gems.${gem.code}`, 1)
              client.users.get(helped[i]).send("You got a "+gem.name+"! You now have "+ (client.fob.fetch(`${helped[i]}.inventory.gems.${gem.code}`)) + ".")
            }
            }
          client.fob.add(`${helped[i]}.inventory.gold`, Math.ceil(hp / 16))
           let levelup = addxp(client.fob, helped[i], Math.ceil(hp / 25), client.users.get(helped[i]), message.channel)
           if (levelup) {
             let level = client.fob.fetch(`${helped[i]}.level.level`) || 1
             let player = game.players.find(p => p.id == helped[i])
             player.level = level
             player.hp = (18 * (level - 1) + 100)
             player.maxhp = (18 * (level - 1) + 100)
        
           }
          }
        }
        
        
        if (enemycount >= game.rounds - 1) return general(game)
        
        setTimeout(() => play(game), 5000)
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