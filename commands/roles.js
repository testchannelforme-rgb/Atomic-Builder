import { SlashCommandBuilder } from 'discord.js';

export const roleCommands = [
  new SlashCommandBuilder().setName('add-role').setDescription('Create a role')
    .addStringOption(o=>o.setName('name').setDescription('Role name').setRequired(true))
    .addStringOption(o=>o.setName('color').setDescription('Hex color, e.g. #5865F2'))
    .addBooleanOption(o=>o.setName('hoist').setDescription('Display separately'))
    .addBooleanOption(o=>o.setName('mentionable').setDescription('Allow mentions')),
  new SlashCommandBuilder().setName('rename-role').setDescription('Rename a role')
    .addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true))
    .addStringOption(o=>o.setName('name').setDescription('New name').setRequired(true)),
  new SlashCommandBuilder().setName('role-color').setDescription('Change role color')
    .addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true))
    .addStringOption(o=>o.setName('color').setDescription('Hex color').setRequired(true)),
  new SlashCommandBuilder().setName('give-role').setDescription('Give a member a role')
    .addUserOption(o=>o.setName('member').setDescription('Member').setRequired(true))
    .addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true)),
  new SlashCommandBuilder().setName('remove-role').setDescription('Remove a role from a member')
    .addUserOption(o=>o.setName('member').setDescription('Member').setRequired(true))
    .addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true)),
  new SlashCommandBuilder().setName('delete-role').setDescription('Delete a role')
    .addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true))
    .addBooleanOption(o=>o.setName('confirm').setDescription('Confirm deletion').setRequired(true))
];

export async function handleRoles(i) {
  const g=i.guild, n=i.commandName;
  if(n==='add-role'){
    const role=await g.roles.create({name:i.options.getString('name',true),color:i.options.getString('color')??undefined,hoist:i.options.getBoolean('hoist')??false,mentionable:i.options.getBoolean('mentionable')??false});
    return i.reply({content:`✅ Created **${role.name}**`,ephemeral:true});
  }
  const role=i.options.getRole('role');
  if(!role) return false;
  if(n==='rename-role'){const old=role.name;await role.setName(i.options.getString('name',true));return i.reply({content:`✅ ${old} → **${role.name}**`,ephemeral:true});}
  if(n==='role-color'){await role.setColor(i.options.getString('color',true));return i.reply({content:`🎨 Updated **${role.name}**`,ephemeral:true});}
  if(n==='give-role'||n==='remove-role'){
    const member=await g.members.fetch(i.options.getUser('member',true).id);
    if(n==='give-role') await member.roles.add(role); else await member.roles.remove(role);
    return i.reply({content:`✅ ${n==='give-role'?'Added':'Removed'} **${role.name}** ${n==='give-role'?'to':'from'} ${member}`,ephemeral:true});
  }
  if(n==='delete-role'){
    if(!i.options.getBoolean('confirm',true)) return i.reply({content:'🛑 Cancelled.',ephemeral:true});
    const name=role.name; await role.delete(); return i.reply({content:`🗑️ Deleted **${name}**`,ephemeral:true});
  }
  return false;
}
