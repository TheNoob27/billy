//const db = require('quick.db')
const Discord = require('discord.js')
const { getgem } = require("../fobfunctions.js")
module.exports.run = async (client, message, args, colors) => {

  let enemycount = 0
  setup()
  
  
function setup() {
  
  let game = {
    players: [],
    playerlist: [],
    rounds: null,
    team: null,
    enemyteam: [],
    regen: null
  }
  
  let embed = new Discord.RichEmbed()
  .setColor(colors.color)
  .setDescription("A new game is starting! React with ⚔️ to join! \n"+message.author.username+", React with ✅ to start, but the game will start automatically in 5 minutes.")
  .addField("Players", "​")
  message.channel.send(embed).then(async msg => {
    await msg.react("⚔️")
    await msg.react("✅")
    
    let filter = (r, user) => ["⚔️", "✅"].includes(r.emoji.name) && !user.bot
    let collector = msg.createReactionCollector(filter, {time: 300000})
    let players = []
    
    collector.on("collect", r => {
      let user = r.users.last()
      
      if (r.emoji == "⚔️") {
        let find = game.players.find(player => player.id == user.id)
        if (find) return;
        
        game.players.push({
          id: user.id,
          level: 1,
          hp: 100,
          tag: user.tag,
          damage: 11,
          maxhp: 100
        })
        game.playerlist.push(user.id)
        
          players.push(user.tag)
        
        msg.edit(embed = new Discord.RichEmbed()
                 .setColor(colors.color)
                 .setDescription("A new game is starting! React with ⚔️ to join! \n"+message.author.username+", React with ✅ to start, but the game will start automatically in 5 minutes.")
                 .addField("Players", "**"+ game.players.map(p => p.tag).join("\n") +"**")
                             )
      } else {
        if (user.id != message.author.id) return;
        if (game.players.length == 0) return;
        collector.stop()
      }
      
    })
    
    collector.on("end", () => {
      let rounds = Math.ceil(Math.random() * 5) + 5
      game.rounds = rounds
      let teams = ["Humans", "Orcs"]
      game.team = teams[Math.floor(Math.random() * teams.length)]
      let orcs = ["Grunt", "Smasher", "Warrior", "Assassin", "Blademaster", "Elite Blademaster", "Warlord", "Tyrant", "Mage", "Archer", "KorKron Elite"] //orcs
    let humans = ["Soldier", "Knight", "Assassin", "Captain", "Mage", "Archer", "Giant", "Guard", "Royal Guard"] // humans
    game.enemyteam = game.team == "Humans" ? orcs : humans
      
      message.channel.send(
      new Discord.RichEmbed()
        .setTitle("Game Starting!")
        .addField("Team", game.team)
        .addField("Enemies", game.rounds)
        .addField("Players", "**"+ game.players.map(p => p.tag).join("\n") +"**")
        .setColor(colors.color)
        .setTimestamp()
      )
      
      game.regen = setInterval(() => {
    for (var i = 0; i < game.players.length; i++) {
      if (game.players[i].hp !== game.players[i].maxhp) game.players[i].hp += 2
    }
    }, 4000)
      setTimeout(() => play(game), 5000)
    })
  })

  }
  
  function play(game) {
    let enemy = getenemy(game)
    let hp = enemy.hp
    
    let embed = new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him.")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    
    message.channel.send(embed).then(async msg => {
      await msg.react("⚔️")
      
    let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.playerlist.includes(user.id)
    let collector = msg.createReactionCollector(filter, {time: 60000})
    let alldied = false
    let enemydied = false
    let helped = []
    
    
    let updatedmg = setInterval(() => {
      msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him.")
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
        collector.stop()
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
            if (Math.random() > .75) {
            let gem = getgem()
            if (gem.name && gem.code) {
              client.fob.add(`${helped[i]}.inventory.gems.${gem.code}`, 1)
              client.users.get(helped[i]).send("You got a "+gem.name+"! You now have "+ (client.fob.fetch(`${helped[i]}.inventory.gems.${gem.code}`)) + ".")
            }
            }
          
          }
        }
        
        
        if (enemycount >= game.rounds - 1) return general(game)
        
        setTimeout(() => play(game), 5000)
      })
    })
  }

  
  function getenemy(game) {
    let enemy = {
      name: null,
      hp: null,
      damage: null
    }
    
    let enemies = game.enemyteam
   enemy.name = enemies[Math.floor(Math.random() * enemies.length)]
    
  
    let e = enemy.name
    
    if (e == "Soldier" || e == "Grunt") {
      enemy.hp = 100
      enemy.damage = 11
    } else if (e == "Mage") {
      enemy.hp = 135
      enemy.damage = 16
    } else if (e == "Archer") {
      enemy.hp = 145
      enemy.damage = 15
    } else if (e == "Knight" || e == "Smasher") {
      enemy.hp = 169
      enemy.damage = 18
    } else if (e == "Captain" || e == "Warrior") {
      enemy.hp = 195
      enemy.damage = 22
    } else if (e == "Blademaster") {
      enemy.hp = 210
      enemy.damage = 25
    } else if (e == "Guard" || e == "Elite Blademaster") {
      enemy.hp = 235
      enemy.damage = 27
    } else if (e == "Assassin") {
      enemy.hp = 240
      enemy.damage = 28
    } else if (e == "Warlord") {
      enemy.hp = 250
      enemy.damage = 28
    } else if (e == "Tyrant" || e == "Giant") {
      enemy.hp = 405
      enemy.damage = 33
    } else if (e == "KorKron Elite" || e == "Royal Guard") {
      enemy.hp = 300
      enemy.damage = 40
    }
    
    return enemy
  }
  
  function end(game, alldied) {
    clearInterval(game.regen)
    let enemyteam = game.team = "Humans" ? "Orcs" : "Humans"
    if (alldied) {
      let embed = new Discord.RichEmbed()
      .setTitle(enemyteam + " Win.")
      .setDescription("Your team wasn't able to successfully kill all of the "+enemyteam+", so you lose.")
      .setColor(colors.error)
      .setTimestamp()
      .setFooter("Better luck next time.")
      
      return message.channel.send(embed)
    } else {
      let embed = new Discord.RichEmbed()
      .setTitle(game.team + " Win!")
      .setDescription("Your team successfully killed all of the "+enemyteam+", so you win. :tada:")
      .setColor(game.team == "Humans" ? "#1f5699" : "#3d8a29")
      .setTimestamp()
      .setFooter("Congratulations. Survivors: "+game.playerlist.length)
      
      return message.channel.send(embed)
    }
  }
  
  function general(game) {
    let enemy = {
      name: "General",
      hp: 1200,
      damage: 45
    }
    
    let hp = enemy.hp
    
    let embed = new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have reached the **"+ enemy.name + "**! Press the sword reaction to hit him.")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    
    message.channel.send(embed).then(async msg => {
      await msg.react("⚔️")
      
    let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.playerlist.includes(user.id)
    let collector = msg.createReactionCollector(filter, {time: 60000})
    let alldied = false
    let enemydied = false
    
    
    let updatedmg = setInterval(() => {
      msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have reached the **"+ enemy.name + "**! Press the sword reaction to hit him.")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
    .setColor(colors.color)
    )
    }, 1000)
    
    collector.on("collect", r => {
      let user = r.users.last()
      let player = game.players.find(p => p.id == user.id)
      enemy.hp -= player.damage
      
      if (enemy.hp <= 0) {
        clearInterval(updatedmg)
        msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have reached the **"+ enemy.name + "**! Press the sword reaction to hit him.")
    .addField("Enemy's HP", "0/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
    .setColor(colors.color)
    )
        enemydied = true
        collector.stop()
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
    .addField("Enemy #"+(enemycount + 1), "You and your team have reached the **"+ enemy.name + "**! Press the sword reaction to hit him.")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
    .setColor(colors.color)
    )
          
          alldied = true
          collector.stop() //message.channel.send("Everyone died!")
        }
      }
      }
    })
      
      collector.on("end", () => {
        if (alldied) return end(game, true)
        if (!alldied && !enemydied) return message.channel.send("You automatically lose, because you took too long.")
        if (enemydied) return end(game)
      })
    })
  
  }
}
module.exports.help = {
  name: "play",
  aliases: ["battle"],
  description: "Play a game that is supposed to mimic FOB.",
  usage: `b!play`,
  category: "Soon"
}