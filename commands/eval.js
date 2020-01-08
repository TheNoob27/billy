const db = require('quick.db')
const Discord = require('discord.js')
const { inspect } = require("util")
const Command = require("../classes/Command.js")

class Eval extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      aliases: ["evaluate"],
      description: "Evaluates a bit of code.",
      usage: `b!eval <code>`,
      category: "Owner Commands",
  example: "b!eval message.channel.send(\"Example Text\")"
    })
  }
  
  async run(client, message, args, colors) {

  if(client.owner == message.author.id) {
    
        let toEval = args.join(" ")
        
            if(toEval) {
              
              if (toEval.startsWith("```") && toEval.endsWith("```")) {
                toEval = toEval
                  .replace(/js|javascript/, "")
                  .slice(3, toEval.length - 5)
                
              }
              
              let notoken = new RegExp(client.token,"g", "i");
              let promise
              
              let hrStart = process.hrtime()
              
              if (toEval.includes("return") || toEval.includes("await")) {
                
                if (toEval.includes("await")) {
                  promise = new Promise((resolve, reject) => resolve(eval("(async function() {\n"+ toEval.replace(/say\(/g, "message.channel.send(").replace(/client.token|process.env.TOKEN|process.env.token/g, "\"password123\"") +"\n}())")))
                } else {
                  promise = new Promise((resolve, reject) => resolve(eval("(function() {\n"+ toEval.replace(/say\(/g, "message.channel.send(").replace(/client.token|process.env.TOKEN|process.env.token/g, "\"password123\"") +"\n}())")))
                }      
                
              } else {
             promise = new Promise((resolve, reject) => resolve(eval(toEval.replace(/say\(/g, "message.channel.send(").replace(/client.token|process.env.TOKEN|process.env.token/g, "\"password123\""))))
              }
              
              promise.then(evaluated => {
              
              //if (typeof evaluated !== "string") {
                evaluated = toEval.includes(".toString()") ? evaluated : inspect(evaluated, { depth: 0 })
              //}
              
            evaluated = evaluated.replace(notoken, "password123")
              
              
                
                let hrDiff;
                hrDiff = process.hrtime(hrStart)
              if (toEval.length > 1014) toEval = "..."
              
    
                
              if (evaluated.length > 1014 /* && evaluated.length < 2048*/) {
                if (evaluated.length > 2048) evaluated = evaluated.slice(0, 2030)
                
                let embed = new Discord.RichEmbed()
              .setTitle("Output")
              .setAuthor("Eval")
              .setDescription(`\`\`\`js\n${evaluated.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
              .addField("Input", `\`\`\`js\n${toEval.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
              .setColor(colors.invis)
              .setFooter(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.`)
              
              return message.channel.send(embed)
              } else {
                //if (evaluated.length > 1024) evaluated = evaluated.slice(0, 1010) + "..."
              
              let embed = new Discord.RichEmbed()
              .setTitle("Eval")
              .setDescription(`**Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.**`)
              .addField("Input", `\`\`\`js\n${toEval.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
              .addField("Output", `\`\`\`js\n${evaluated.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
              .setColor(colors.invis)
              
              return message.channel.send(embed)
               
              }
               }).catch(e => {
                if (toEval.length > 1014) toEval = "..."
             
          let embed = new Discord.RichEmbed()
              .setTitle("Eval")
              .setDescription(`***ERROR***`)
              .addField("Input", `\`\`\`js\n${toEval.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
              .addField("Output", `\`\`\`js\n${e.stack ? e.stack.length > 1014 ? e.message : e.stack : e}\n\`\`\``)
              .setColor(colors.invis)
              
              return message.channel.send(embed)
              
              })
            } else {
                message.channel.send("I can't evaluate your thoughts, come on. Specify something.")
            }
        
    } else {
        return message.channel.send("no")//.then(m => m.delete(10000))
    }


  
}
  
}

function print(...x) {
  console.log(...x)
  return x
}
module.exports = Eval