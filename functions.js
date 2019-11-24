module.exports = {
  findmember: function(message, toFind = '', filter) {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.get(toFind);
        
    if (toFind == "me") target = message.member
    
        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }
            
        if (!target && !filter) 
            target = message.member;
        
    
        return target;
    },
  
  finduser: function(message, toFind = '', filter) {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.get(toFind);
        
      if (toFind == "me") target = message.member
    
        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }
            
        if (!target && !filter) 
            target = message.member;
        
            
       if (target) return target.user;
       else return null
    },
  
  
  findanyuser: function(client, message, toFind = '') {
        toFind = toFind.toLowerCase();

        let target = client.users.get(toFind);
        
      if (toFind == "me") target = message.author
    
        if (!target && message.mentions.users)
            target = message.mentions.users.first();

        if (!target && toFind) {
            target = client.users.find(member => {
                return member.tag.toLowerCase().includes(toFind)
            });
        }
            
        if (!target) 
            target = message.author;
            
        return target;
    
    }
  
}