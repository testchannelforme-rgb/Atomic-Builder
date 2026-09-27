import { SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs/promises';
import { buildBlueprint } from '../utils/builder.js';
export const templateCommands=[
 new SlashCommandBuilder().setName('template').setDescription('Build a server preset')
  .addStringOption(o=>o.setName('preset').setDescription('Preset').setRequired(true).addChoices({name:'Atomic.Dev',value:'atomic-dev'},{name:'Community',value:'community'})),
 new SlashCommandBuilder().setName('preview').setDescription('Preview a server preset')
  .addStringOption(o=>o.setName('preset').setDescription('Preset').setRequired(true).addChoices({name:'Atomic.Dev',value:'atomic-dev'},{name:'Community',value:'community'})),
 new SlashCommandBuilder().setName('setup').setDescription('Build the Atomic.Dev preset')
];
async function load(name){return JSON.parse(await fs.readFile(new URL(`../templates/${name}.json`,import.meta.url),'utf8'));}
export async function handleTemplates(i){
 const n=i.commandName;if(!['template','preview','setup'].includes(n))return false;
 const preset=n==='setup'?'atomic-dev':i.options.getString('preset',true);const bp=await load(preset);
 if(n==='preview')return i.reply({content:`⚛️ **${bp.name} preview**\n\n${bp.categories.map(c=>`**${c.name}** — ${c.channels.length} channels`).join('\n')}\n\n🎭 ${bp.roles.length} roles`,ephemeral:true});
 await i.deferReply({ephemeral:true});await buildBlueprint(i.guild,bp);return i.editReply(`✅ **${bp.name}** structure built.`);
}
