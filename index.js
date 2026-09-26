import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder
} from 'discord.js';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || '1553394791683850280';

if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN is missing.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName('preview')
    .setDescription('Preview the Atomic.Dev server layout'),

  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Build the Atomic.Dev server automatically')
].map(command => command.toJSON());

const blueprint = [
  {
    category: '⚛️ START HERE',
    channels: [
      ['welcome', 'text'],
      ['rules', 'text'],
      ['announcements', 'text'],
      ['links', 'text']
    ]
  },
  {
    category: '🌐 COMMUNITY',
    channels: [
      ['general', 'text'],
      ['introductions', 'text'],
      ['showcase', 'text'],
      ['general-vc', 'voice']
    ]
  },
  {
    category: '🏎️ GRIDHQ',
    channels: [
      ['gridhq-chat', 'text'],
      ['gridhq-updates', 'text'],
      ['gridhq-feedback', 'forum']
    ]
  },
  {
    category: '📚 STILL',
    channels: [
      ['still-chat', 'text'],
      ['still-updates', 'text'],
      ['still-feedback', 'forum']
    ]
  },
  {
    category: '💰 LEFT',
    channels: [
      ['left-chat', 'text'],
      ['left-updates', 'text'],
      ['left-feedback', 'forum']
    ]
  },
  {
    category: '🧪 DEVELOPMENT',
    channels: [
      ['bug-reports', 'forum'],
      ['feature-requests', 'forum'],
      ['beta-testing', 'text'],
      ['sneak-peeks', 'text']
    ]
  }
];

const channelTypes = {
  text: ChannelType.GuildText,
  voice: ChannelType.GuildVoice,
  forum: ChannelType.GuildForum
};

async function buildServer(guild) {
  for (const section of blueprint) {
    let category = guild.channels.cache.find(
      c =>
        c.type === ChannelType.GuildCategory &&
        c.name === section.category
    );

    if (!category) {
      category = await guild.channels.create({
        name: section.category,
        type: ChannelType.GuildCategory,
        reason: 'Atomic Builder setup'
      });
    }

    for (const [name, type] of section.channels) {
      const exists = guild.channels.cache.find(
        c => c.name === name && c.parentId === category.id
      );

      if (!exists) {
        await guild.channels.create({
          name,
          type: channelTypes[type],
          parent: category.id,
          reason: 'Atomic Builder setup'
        });
      }
    }
  }
}

client.once('ready', async () => {
  console.log(`⚛️ Atomic Builder online as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Slash commands registered.');
  } catch (error) {
    console.error('❌ Command registration failed:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.inGuild()) {
    return interaction.reply({
      content: '❌ Use this command inside a Discord server.',
      ephemeral: true
    });
  }

  if (
    !interaction.memberPermissions.has(
      PermissionFlagsBits.Administrator
    )
  ) {
    return interaction.reply({
      content: '🔒 Administrator permission required.',
      ephemeral: true
    });
  }

  if (interaction.commandName === 'preview') {
    const text = blueprint
      .map(
        section =>
          `**${section.category}**\n${section.channels
            .map(([name]) => `• ${name}`)
            .join('\n')}`
      )
      .join('\n\n');

    return interaction.reply({
      content: `⚛️ **Atomic Builder Preview**\n\n${text}`,
      ephemeral: true
    });
  }

  if (interaction.commandName === 'setup') {
    await interaction.deferReply({ ephemeral: true });

    try {
      await buildServer(interaction.guild);

      await interaction.editReply(
        '✅ **Atomic.Dev server created!**\n\nExisting channels were preserved.'
      );
    } catch (error) {
      console.error(error);

      await interaction.editReply(
        '❌ Build failed. Check Atomic Builder permissions.'
      );
    }
  }
});

client.login(TOKEN);
