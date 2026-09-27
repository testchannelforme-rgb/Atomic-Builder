import { SlashCommandBuilder, ChannelType } from 'discord.js';
const types={text:ChannelType.GuildText,voice:ChannelType.GuildVoice,forum:ChannelType.GuildForum};

export const channelCommands=[
 new SlashCommandBuilder().setName('add-channel').setDescription('Create a channel')
  .addStringOption(o=>o.setName('name').setDescription('Name').setRequired(true))
  .addStringOption(o=>o.setName('type').setDescription('Type').setRequired(true).addChoices({name:'Text',value:'text'},{name:'Voice',value:'voice'},{name:'Forum',value:'forum'}))
  .addChannelOption(o=>o.setName('category').setDescription('Category').addChannelTypes(ChannelType.GuildCategory)),
 new SlashCommandBuilder().setName('rename-channel').setDescription('Rename a channel')
  .addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true))
  .addStringOption(o=>o.setName('name').setDescription('New name').setRequired(true)),
 new SlashCommandBuilder().setName('move-channel').setDescription('Move a channel')
  .addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true))
  .addChannelOption(o=>o.setName('category').setDescription('Category').addChannelTypes(ChannelType.GuildCategory).setRequired(true)),
 new SlashCommandBuilder().setName('edit-channel').setDescription('Edit channel topic/slowmode/NSFW')
  .addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true))
  .addStringOption(o=>o.setName('topic').setDescription('New topic'))
  .addIntegerOption(o=>o.setName('slowmode').setDescription('Slowmode seconds').setMinValue(0).setMaxValue(21600))
  .addBooleanOption(o=>o.setName('nsfw').setDescription('Mark NSFW')),
 new SlashCommandBuilder().setName('clone-channel').setDescription('Clone a channel')
  .addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true))
  .addStringOption(o=>o.setName('name').setDescription('Clone name')),
 new SlashCommandBuilder().setName('delete-channel').setDescription('Delete a channel')
  .addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true))
  .addBooleanOption(o=>o.setName('confirm').setDescription('Confirm deletion').setRequired(true))
];

export async function handleChannels(i){
 const n=i.commandName,g=i.guild;
 if(n==='add-channel'){
   const c=await g.channels.create({name:i.options.getString('name',true),type:types[i.options.getString('type',true)],parent:i.options.getChannel('category')?.id??null});
   return i.reply({content:`✅ Created ${c}`,ephemeral:true});
 }
 const c=i.options.getChannel('channel'); if(!c)return false;
 if(n==='rename-channel'){const old=c.name;await c.setName(i.options.getString('name',true));return i.reply({content:`✅ ${old} → **${c.name}**`,ephemeral:true});}
 if(n==='move-channel'){if(c.type===ChannelType.GuildCategory)return i.reply({content:'❌ A category cannot be nested.',ephemeral:true});await c.setParent(i.options.getChannel('category',true).id);return i.reply({content:'✅ Channel moved.',ephemeral:true});}
 if(n==='edit-channel'){
   const topic=i.options.getString('topic'), slow=i.options.getInteger('slowmode'), nsfw=i.options.getBoolean('nsfw');
   if(topic!==null && 'setTopic' in c) await c.setTopic(topic);
   if(slow!==null && 'setRateLimitPerUser' in c) await c.setRateLimitPerUser(slow);
   if(nsfw!==null && 'setNSFW' in c) await c.setNSFW(nsfw);
   return i.reply({content:'✅ Channel settings updated.',ephemeral:true});
 }
 if(n==='clone-channel'){const clone=await c.clone({name:i.options.getString('name')??`${c.name}-copy`});return i.reply({content:`✅ Cloned ${clone}`,ephemeral:true});}
 if(n==='delete-channel'){if(!i.options.getBoolean('confirm',true))return i.reply({content:'🛑 Cancelled.',ephemeral:true});const name=c.name;await i.reply({content:`🗑️ Deleting **${name}**…`,ephemeral:true});await c.delete();return true;}
 return false;
}
