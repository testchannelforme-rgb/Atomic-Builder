import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export const permissionCommands=[
 new SlashCommandBuilder().setName('lock').setDescription('Lock a text channel').addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true)),
 new SlashCommandBuilder().setName('unlock').setDescription('Unlock a text channel').addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true)),
 new SlashCommandBuilder().setName('hide').setDescription('Hide a channel from @everyone').addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true)),
 new SlashCommandBuilder().setName('unhide').setDescription('Unhide a channel').addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true)),
 new SlashCommandBuilder().setName('permissions').setDescription('Set basic role permissions on a channel')
  .addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true))
  .addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true))
  .addBooleanOption(o=>o.setName('view').setDescription('Can view'))
  .addBooleanOption(o=>o.setName('send').setDescription('Can send messages'))
  .addBooleanOption(o=>o.setName('manage').setDescription('Can manage channel'))
];
export async function handlePermissions(i){
 const n=i.commandName,c=i.options.getChannel('channel');if(!c)return false;
 if(n==='lock'||n==='unlock'){await c.permissionOverwrites.edit(i.guild.roles.everyone,{SendMessages:n==='unlock'?null:false});return i.reply({content:n==='lock'?'🔒 Locked.':'🔓 Unlocked.',ephemeral:true});}
 if(n==='hide'||n==='unhide'){await c.permissionOverwrites.edit(i.guild.roles.everyone,{ViewChannel:n==='unhide'?null:false});return i.reply({content:n==='hide'?'🙈 Hidden.':'👀 Visible again.',ephemeral:true});}
 if(n==='permissions'){
   const role=i.options.getRole('role',true), view=i.options.getBoolean('view'),send=i.options.getBoolean('send'),manage=i.options.getBoolean('manage');
   const p={}; if(view!==null)p.ViewChannel=view;if(send!==null)p.SendMessages=send;if(manage!==null)p.ManageChannels=manage;
   await c.permissionOverwrites.edit(role,p);return i.reply({content:`✅ Updated permissions for **${role.name}**.`,ephemeral:true});
 }
 return false;
}
