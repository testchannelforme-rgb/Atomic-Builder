import { ChannelType } from 'discord.js';

const typeMap = {
  text: ChannelType.GuildText,
  voice: ChannelType.GuildVoice,
  forum: ChannelType.GuildForum
};

export async function buildBlueprint(guild, blueprint) {
  for (const role of blueprint.roles ?? []) {
    if (!guild.roles.cache.some(r => r.name === role.name)) {
      await guild.roles.create({
        name: role.name,
        color: role.color ?? undefined,
        hoist: !!role.hoist,
        mentionable: !!role.mentionable,
        reason: 'Atomic Builder blueprint'
      });
    }
  }

  for (const section of blueprint.categories ?? []) {
    let category = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name === section.name
    );
    if (!category) {
      category = await guild.channels.create({
        name: section.name,
        type: ChannelType.GuildCategory,
        reason: 'Atomic Builder blueprint'
      });
    }

    for (const item of section.channels ?? []) {
      let channel = guild.channels.cache.find(
        c => c.parentId === category.id && c.name === item.name
      );
      if (!channel) {
        channel = await guild.channels.create({
          name: item.name,
          type: typeMap[item.type] ?? ChannelType.GuildText,
          parent: category.id,
          topic: item.type === 'text' ? item.topic : undefined,
          reason: 'Atomic Builder blueprint'
        });
      }
    }
  }
}

export function exportBlueprint(guild) {
  const roles = guild.roles.cache
    .filter(r => !r.managed && r.id !== guild.id)
    .sort((a,b) => a.position-b.position)
    .map(r => ({
      name: r.name,
      color: r.hexColor === '#000000' ? null : r.hexColor,
      hoist: r.hoist,
      mentionable: r.mentionable
    }));

  const categories = guild.channels.cache
    .filter(c => c.type === ChannelType.GuildCategory)
    .sort((a,b) => a.position-b.position)
    .map(category => ({
      name: category.name,
      channels: guild.channels.cache
        .filter(c => c.parentId === category.id)
        .sort((a,b) => a.position-b.position)
        .map(c => ({
          name: c.name,
          type:
            c.type === ChannelType.GuildVoice ? 'voice' :
            c.type === ChannelType.GuildForum ? 'forum' : 'text',
          topic: 'topic' in c ? c.topic ?? undefined : undefined
        }))
    }));

  return { name: guild.name, roles, categories };
}
