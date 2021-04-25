const Discord = require('discord.js')
const { inspect } = require("util")
const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      aliases: ["evaluate"],
      description: "Evaluates a bit of code.",
      usage: `b!eval <code>`,
      category: "Owner Commands",
      owner: true,
      example: "b!eval message.channel.send(\"Example Text\")"
    })

   Object.defineProperty(this, "notoken", {
      value: new RegExp(`${process.env.TOKEN}|${process.env.TOKEN.split(".").last()}`, "g", "i"),
      configurable: true,
      writable: true
    })
  }

  async run(message, args) {
    if (!message.author.owner) return message.channel.send(Math.random() > 0.66 ? "why" : "no")

    let tags = Tagify({
      string: args.join(" "),
      prefix: "--",
      silenceJSONErrors: true,
      negativeNumbers: true // why not, i wanna experiment
    }, "silent", "async", "function", "long", "(type|load)", "showProxy", "showHidden", "delete", {
      depth: Number,
      require: Object,
      //"show(Proxy|Hidden)": Boolean,
      "(max(Array|String)|break)Length": Number,
      compact: /(true|false|\d+)/
    })
    tags.data.showHidden = tags.matches.includes("showHidden")
    tags.data.showProxy = tags.matches.includes("showProxy")

    if (tags.matches.includes("long")) return this.longEval(message, args.join(" ").replace("--long", ""))
    let toEval = tags.newString
    
    if (toEval.startsWith("```") && toEval.endsWith("```")) {
      toEval = toEval
      .replace(/js|javascript/, "")
      .slice(3, toEval.length - 5)
      .trim()
    }
    
    if (message.attachments.size && message.attachments.first().name.includes(".txt")) {
      toEval += await require("node-fetch")(message.attachments.first().url).then(res => res.text()).default("")
    }

    if (!toEval) return message.channel.send("I can't evaluate your thoughts, come on. Specify something.")
    
    if (tags.matches.includes("require")) {
      /* requireData = { "discord.js": ["Util", "Client"], "child_process": { exec: Run } } */
      let requires = "", requireData = tags.data.require 
      Object.keys(requireData).map(mod => {
        let reqs = requireData[mod]
        if (typeof reqs === "string") requires += `const ${reqs} = `
        else if (reqs instanceof Array) requires += `const { ${reqs.join(", ")} } = `
        else if (typeof reqs === "object") requires += `const ${inspect(reqs, { depth: null }).replace(/: ?'/g, ": ").replace(/'/g, "")} = `
        
        if (mod === "discord.js") requires += "Discord\n"
        else requires += `require("${mod}")\n`
      })
      
      toEval = requires + "\n" + toEval
    }

    let promise;
    if ((tags.matches.includes("load") || tags.matches.includes("type")) && this.client.canSpeak(message.channel)) await message.channel.startTyping(0)

    let replace = (string = "") => {
      let s = string.replace(/say\(/g, "message.channel.send(").replace(/client.token|process.env.TOKEN|process.env.token/g, "client['faketoken']")
      return s.startsWith("{") && s.endsWith("}") ? `(${s})` : s
    }
    
    const client = this.client
    
    if ((tags.matches.includes("async") || tags.matches.includes("function")) || (toEval.includes("return") || toEval.includes("await")) && ["function", "=>", "{"].every(x => !toEval.includes(x))) {
      if (tags.matches.includes("async") || toEval.includes("await")) {
        promise = new Promise((resolve, reject) => resolve(eval("(async () => {\n"+ replace(toEval) +"\n})()")))
      } else {
        promise = new Promise((resolve, reject) => resolve(eval("(() => {\n"+ replace(toEval) +"\n})()")))
      }
    } else {
      promise = new Promise((resolve, reject) => resolve(eval(replace(toEval))))
    }
    
    let hrTime = process.hrtime()
    promise.then(evaluated => {
      if (tags.matches.includes("delete") && message.channel.hasPermission("MANAGE_MESSAGES")) message.delete()
      if (tags.matches.includes("silent")) return;
      let time = process.hrtime.format(process.hrtime(hrTime))
      if (message.channel.typing) message.channel.stopTyping(true)
      
      evaluated = toEval.includes(".toString()") && typeof evaluated === "string" ? evaluated : inspect(evaluated, { depth: 0, ...tags.data })
      evaluated = evaluated.replace(this.notoken, "password123")

      if (toEval.length > 1014) toEval = "..."
      if (evaluated.length > 1014) {
        if (evaluated.length > 2048) evaluated = evaluated.slice(0, 2030)

        let embed = new Embed()
        .setTitle("Output")
        .setAuthor("Eval")
        .setDescription(`\`\`\`js\n${evaluated.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
        .addField("Input", `\`\`\`js\n${toEval.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
        .setColor(this.client.colors.invis)
        .setFooter(`Executed in ${time}.`)

        if (message.channel.messages.cache.has(message.eval)) return message.channel.messages.cache.get(message.eval).edit(embed)
        else return message.channel.send(embed)
      } else {
        let embed = new Embed()
        .setTitle("Eval")
        .setDescription(`**Executed in ${time}.**`)
        .addField("Input", `\`\`\`js\n${toEval.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
        .addField("Output", `\`\`\`js\n${evaluated.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
        .setColor(this.client.colors.invis)

        if (message.channel.messages.cache.has(message.eval)) return message.channel.messages.cache.get(message.eval).edit(embed)
        else return message.channel.send(embed)
      }
    }).catch(e => {
      if (tags.matches.includes("silent")) return;
      let time = process.hrtime.format(process.hrtime(hrTime));
      if (message.channel.typing) message.channel.stopTyping(true)

      if (toEval.length > 1014) toEval = "..."
      if (!e) e = {}

      let embed = new Embed()
      .setTitle("Eval")
      .setDescription(`**ERROR**`)
      .addField("Input", `\`\`\`js\n${toEval.replace(/```/g, "`‎`‎`‎")}\n\`\`\``)
      .addField("Output", `\`\`\`js\n${e.message}\n\`\`\``)
      .setColor(this.client.colors.error)
      .setFooter(`Failed in ${time}.`)

      if (message.channel.messages.cache.has(message.eval)) return message.channel.messages.cache.get(message.eval).edit(embed)
      else return message.channel.send(embed)
    }).then(msg => msg ? message.eval = msg.id : null)
  }
  
  longEval(message, toEval) {
    if (typeof toEval !== "string") toEval = ""
    else if (toEval) toEval += "\n"
    else toEval = ""
    
    const collector = message.channel.createMessageCollector(m => !m.partial && m.author.owner, {time: 300000})
    
    collector.on("collect", async message => {
      let i = message.content.toLowerCase()
      if (i === "undo") {
        if (!toEval.trim()) return message.channel.send("There's no code to undo!")
        let old = toEval = toEval.split("\n").trim("")
        toEval = toEval.slice(0, toEval.length - 1)
        
        await message.channel.send(
          "Undid one line of code: ```js\n" + 
          old.slice(old.length > 3 ? old.length - 3 : 0).join("\n") + 
          "\n``` -> ```js\n" + 
          (toEval.slice(toEval.length > 2 ? toEval.length - 2 : 0).join("\n") || "\u200b") + 
          "\n```"
        )
        
        return toEval = toEval.join("\n") + "\n"
      } else if (i === "done" || i === "finish") return collector.stop("done")
      
      if (!message.content && message.attachments.size && message.attachments.first().name.includes(".txt")) {
        toEval += await require("node-fetch")(message.attachments.first().url).then(res => res.text()).default("")
      } else toEval += message.content + "\n"
    })
    
    collector.once("end", (_, reason) => {
      if (reason !== "done") return message.channel.send("Cancelled due to lack of activity (You never said \"done\".)")
      return this.run(message, [toEval])
    })
    
    return collector
  }
}

function print(...x) {
  console.log(...x)
  return x[0]
}