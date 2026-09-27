import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { exportBlueprint, buildBlueprint } from '../utils/builder.js';
export const backupCommands=[
 new SlashCommandBuilder().setName('backup').setDescription('Export server structure as JSON'),
 new SlashCommandBuilder().setName('build').setDescription('Build from an Atomic Builder JSON blueprint')
  .addAttachmentOption(o=>o.setName('blueprint').setDescription('JSON blueprint').setRequired(true))
];
export async function handleBackup(i){
 if(i.commandName==='backup'){
   const data=Buffer.from(JSON.stringify(exportBlueprint(i.guild),null,2));
   return i.reply({content:'💾 Server structure backup:',files:[new AttachmentBuilder(data,{name:'atomic-builder-backup.json'})],ephemeral:true});
 }
 if(i.commandName==='build'){
   await i.deferReply({ephemeral:true});
   const a=i.options.getAttachment('blueprint',true);
   if(!a.name.toLowerCase().endsWith('.json'))return i.editReply('❌ Upload a .json blueprint.');
   const res=await fetch(a.url); if(!res.ok)return i.editReply('❌ Could not download blueprint.');
   const bp=await res.json(); await buildBlueprint(i.guild,bp);
   return i.editReply('✅ Blueprint built. Existing matching items were preserved.');
 }
 return false;
}
