import { SlashCommandBuilder, ChannelType } from 'discord.js';
export const categoryCommands=[
 new SlashCommandBuilder().setName('add-category').setDescription('Create a category').addStringOption(o=>o.setName('name').setDescription('Name').setRequired(true)),
 new SlashCommandBuilder().setName('rename-category').setDescription('Rename a category').addChannelOption(o=>o.setName('category').setDescription('Category').addChannelTypes(ChannelType.GuildCategory).setRequired(true)).addStringOption(o=>o.setName('name').setDescription('New name').setRequired(true)),
 new SlashCommandBuilder().setName('delete-category').setDescription('Delete an EMPTY category').addChannelOption(o=>o.setName('category').setDescription('Category').addChannelTypes(ChannelType.GuildCategory).setRequired(true)).addBooleanOption(o=>o.setName('confirm').setDescription('Confirm deletion').setRequired(true))
];
export async function handleCategories(i){
 const n=i.commandName;
 if(n==='add-category'){const c=await i.guild.channels.create({name:i.options.getString('name',true),type:ChannelType.GuildCategory});return i.reply({content:`✅ Created **${c.name}**`,ephemeral:true});}
 const c=i.options.getChannel('category'); if(!c)return false;
 if(n==='rename-category'){const old=c.name;await c.setName(i.options.getString('name',true));return i.reply({content:`✅ ${old} → **${c.name}**`,ephemeral:true});}
 if(n==='delete-category'){
  if(!i.options.getBoolean('confirm',true))return i.reply({content:'🛑 Cancelled.',ephemeral:true});
  if(c.children.cache.size)return i.reply({content:'❌ Category is not empty. Move/delete its channels first.',ephemeral:true});
  const name=c.name;await c.delete();return i.reply({content:`🗑️ Deleted **${name}**`,ephemeral:true});
 }
 return false;
}
