import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { requireAdmin } from './utils/safeguards.js';
import { roleCommands, handleRoles } from './commands/roles.js';
import { channelCommands, handleChannels } from './commands/channels.js';
import { categoryCommands, handleCategories } from './commands/categories.js';
import { permissionCommands, handlePermissions } from './commands/permissions.js';
import { moderationCommands, handleModeration } from './commands/moderation.js';
import { backupCommands, handleBackup } from './commands/backup.js';
import { templateCommands, handleTemplates } from './commands/templates.js';
import { wizardCommands, handleWizard, handleWizardButton } from './commands/wizard.js';

const TOKEN=process.env.DISCORD_TOKEN;
const CLIENT_ID=process.env.CLIENT_ID||'1553394791683850280';
if(!TOKEN){console.error('❌ DISCORD_TOKEN missing.');process.exit(1);}

const commandGroups=[roleCommands,channelCommands,categoryCommands,permissionCommands,moderationCommands,backupCommands,templateCommands,wizardCommands];
const commands=commandGroups.flat().map(c=>c.toJSON());
const handlers=[handleRoles,handleChannels,handleCategories,handlePermissions,handleModeration,handleBackup,handleTemplates,handleWizard];

const client=new Client({intents:[GatewayIntentBits.Guilds]});

client.once('ready',async()=>{
 console.log(`⚛️ Atomic Builder V3 online as ${client.user.tag}`);
 try{
  const rest=new REST({version:'10'}).setToken(TOKEN);
  await rest.put(Routes.applicationCommands(CLIENT_ID),{body:commands});
  console.log(`✅ Registered ${commands.length} V3 slash commands.`);
 }catch(e){console.error('❌ Command registration failed:',e);}
});

client.on('interactionCreate',async i=>{
 try{
  if(i.isButton()){
   if(!i.inGuild()||!(await requireAdmin(i)))return;
   return handleWizardButton(i);
  }
  if(!i.isChatInputCommand())return;
  if(!i.inGuild())return i.reply({content:'❌ Use Atomic Builder inside a server.',ephemeral:true});
  if(!(await requireAdmin(i)))return;
  for(const handler of handlers){
   const handled=await handler(i);
   if(handled!==false)return;
  }
 }catch(e){
  console.error(e);
  const msg=`❌ Couldn't do that: ${e.message}`;
  if(i.deferred)return i.editReply(msg).catch(()=>{});
  if(i.replied)return i.followUp({content:msg,ephemeral:true}).catch(()=>{});
  return i.reply({content:msg,ephemeral:true}).catch(()=>{});
 }
});

client.login(TOKEN);
