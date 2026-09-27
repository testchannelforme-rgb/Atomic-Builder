import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
export const wizardCommands=[
 new SlashCommandBuilder().setName('wizard').setDescription('Interactive quick-start server builder'),
 new SlashCommandBuilder().setName('help').setDescription('Show Atomic Builder commands')
];
export async function handleWizard(i){
 if(i.commandName==='help')return i.reply({content:
`⚛️ **Atomic Builder V3**
**Build:** /wizard /template /setup /preview /backup /build
**Channels:** /add-channel /edit-channel /rename-channel /move-channel /clone-channel /delete-channel
**Categories:** /add-category /rename-category /delete-category
**Roles:** /add-role /rename-role /role-color /give-role /remove-role /delete-role
**Permissions:** /lock /unlock /hide /unhide /permissions
**Tools:** /purge /server-info`,ephemeral:true});

 if(i.commandName==='wizard'){
  const row=new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId('wiz_atomic').setLabel('Atomic.Dev').setStyle(ButtonStyle.Primary),
   new ButtonBuilder().setCustomId('wiz_community').setLabel('Community').setStyle(ButtonStyle.Secondary),
   new ButtonBuilder().setCustomId('wiz_blank').setLabel('Blank Starter').setStyle(ButtonStyle.Success)
  );
  return i.reply({content:'🪄 **Server Wizard**\nChoose a starting point:',components:[row],ephemeral:true});
 }
 return false;
}
export async function handleWizardButton(i){
 if(!i.customId.startsWith('wiz_'))return false;
 if(i.customId==='wiz_blank'){
   await i.guild.channels.create({name:'📌 INFORMATION',type:ChannelType.GuildCategory});
   await i.guild.channels.create({name:'💬 COMMUNITY',type:ChannelType.GuildCategory});
   return i.update({content:'✅ Blank starter categories created. Use `/add-channel` and `/add-role` to customize them.',components:[]});
 }
 const name=i.customId==='wiz_atomic'?'atomic-dev':'community';
 const { buildBlueprint }=await import('../utils/builder.js');
 const fs=(await import('node:fs/promises')).default;
 const bp=JSON.parse(await fs.readFile(new URL(`../templates/${name}.json`,import.meta.url),'utf8'));
 await i.deferUpdate();await buildBlueprint(i.guild,bp);return i.editReply({content:`✅ **${bp.name}** starter built.`,components:[]});
}
