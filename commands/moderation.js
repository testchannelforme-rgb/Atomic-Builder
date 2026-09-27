import { SlashCommandBuilder, ChannelType } from 'discord.js';
export const moderationCommands=[
 new SlashCommandBuilder().setName('purge').setDescription('Delete recent messages')
  .addIntegerOption(o=>o.setName('amount').setDescription('1–100 messages').setRequired(true).setMinValue(1).setMaxValue(100))
  .addBooleanOption(o=>o.setName('confirm').setDescription('Confirm purge').setRequired(true)),
 new SlashCommandBuilder().setName('server-info').setDescription('Show server statistics')
];
export async function handleModeration(i){
 if(i.commandName==='server-info'){
   const g=i.guild;return i.reply({content:`⚛️ **${g.name}**\n👥 Members: **${g.memberCount}**\n🗂️ Categories: **${g.channels.cache.filter(c=>c.type===ChannelType.GuildCategory).size}**\n#️⃣ Channels: **${g.channels.cache.filter(c=>c.type!==ChannelType.GuildCategory).size}**\n🎭 Roles: **${g.roles.cache.size-1}**`,ephemeral:true});
 }
 if(i.commandName==='purge'){
   if(!i.options.getBoolean('confirm',true))return i.reply({content:'🛑 Cancelled.',ephemeral:true});
   if(!i.channel?.bulkDelete)return i.reply({content:'❌ Purge only works in compatible text channels.',ephemeral:true});
   const deleted=await i.channel.bulkDelete(i.options.getInteger('amount',true),true);
   return i.reply({content:`🧹 Deleted **${deleted.size}** recent messages.`,ephemeral:true});
 }
 return false;
}
