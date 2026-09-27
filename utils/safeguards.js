import { PermissionFlagsBits } from 'discord.js';

export function isAdmin(interaction) {
  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
}

export async function requireAdmin(interaction) {
  if (isAdmin(interaction)) return true;
  await interaction.reply({ content: '🔒 Administrator permission required.', ephemeral: true });
  return false;
}
