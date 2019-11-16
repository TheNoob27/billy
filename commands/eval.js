const db = require('quick.db')
const Discord = require('discord.js')
const { inspect } = require("util")
const ms = require("parse-ms")

exports.run = async (client, message, args, colors, prefix) => {

  if(client.owner == message.author.id) {
    
        let toEval = args.join(" ")

        try {
          
            if(toEval) {
              let notoken = new RegExp(client.token,"g", "i");
              
              let evaluated = inspect(eval(toEval.replace(/say\(/g, "message.channel.send(").replace(/client.token|process.env.TOKEN|process.env.token/g, "\"password123\""), { depth: 0 } ))
             evaluated = evaluated.replace(notoken, "password123")
             
            
              
              
                let hrStart = process.hrtime()
                let hrDiff;
                hrDiff = process.hrtime(hrStart)
              if (toEval.length > 1024) toEval = "..."
              if (evaluated.length > 1024 && evaluated.length < 2048) {
                let embed = new Discord.RichEmbed()
              .setTitle("Output")
              .setAuthor("Eval")
              .setDescription(`\`\`\`javascript\n${evaluated}\n\`\`\``)
              .addField("Input", `\`\`\`javascript\n${toEval}\n\`\`\``)
              .setColor(colors.color)
              
              return message.channel.send(embed)
              } else {
                if (evaluated.length > 1024) evaluated = "..."
              
              let embed = new Discord.RichEmbed()
              .setTitle("Eval")
              .setDescription(`**Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.**`)
              .addField("Input", `\`\`\`javascript\n${toEval}\n\`\`\``)
              .addField("Output", `\`\`\`javascript\n${evaluated}\n\`\`\``)
              .setColor(colors.color)
              
              return message.channel.send(embed)
               // message.channel.send(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.*\`\`\`javascript\n${evaluated}\n\`\`\``, { maxLength: 1900 })
              }
            } else {
                message.channel.send("I can't evaluate your thoughts, come on. Specify something.")
            }
        } catch(e) {
          if (toEval.length > 1024) toEval = "..."
             
          let embed = new Discord.RichEmbed()
              .setTitle("Eval")
              .setDescription(`***ERROR***`)
              .addField("Input", `\`\`\`javascript\n${toEval}\n\`\`\``)
              .addField("Output", `\`\`\`javascript\n${e.stack}\n\`\`\``)
              .setColor(colors.color)
              
              return message.channel.send(embed)
            //message.channel.send(`Error whilst evaluating: \`${e.message}\``)
        }
    } else {
        return message.channel.send("no").then(m => m.delete(10000))
    }


  
}
module.exports.help = {
  name: "eval",
  aliases: ["evaluate"],
  description: "Evaluates a bit of code.",
  usage: `k!eval <code>`,
  category: "Owner Commands",
  example: "k!eval message.channel.send(\"Example Text\")"
}