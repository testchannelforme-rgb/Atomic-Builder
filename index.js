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
  console.error('❌ DISCORD_TOKEN missing.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('add-category')
    .setDescription('Create a custom category')
    .addStringOption(o =>
      o.setName('name').setDescription('Category name').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('add-channel')
    .setDescription('Create a custom channel')
    .addStringOption(o =>
      o.setName('name').setDescription('Channel name').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('type')
        .setDescription('Channel type')
        .setRequired(true)
        .addChoices(
          { name: '💬 Text', value: 'text' },
          { name: '🔊 Voice', value: 'voice' },
          { name: '🧵 Forum', value: 'forum' }
        )
    )
    .addChannelOption(o =>
      o.setName('category')
        .setDescription('Category to put it in')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('add-role')
    .setDescription('Create a custom role')
    .addStringOption(o =>
      o.setName('name').setDescription('Role name').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('rename-channel')
    .setDescription('Rename a channel')
    .addChannelOption(o =>
      o.setName('channel').setDescription('Channel').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('name').setDescription('New name').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('move-channel')
    .setDescription('Move a channel into another category')
    .addChannelOption(o =>
      o.setName('channel').setDescription('Channel').setRequired(true)
    )
    .addChannelOption(o =>
      o.setName('category')
        .setDescription('New category')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('delete-channel')
    .setDescription('Delete a channel')
    .addChannelOption(o =>
      o.setName('channel').setDescription('Channel to delete').setRequired(true)
    )
    .addBooleanOption(o =>
      o.setName('confirm')
        .setDescription('You MUST choose True to confirm deletion')
        .setRequired(true)
    )
].map(c => c.toJSON());

function isAdmin(interaction) {
  return interaction.memberPermissions?.has(
    PermissionFlagsBits.Administrator
  );
}

client.once('ready', async () => {
  console.log(`⚛️ Atomic Builder V2 online as ${client.user.tag}`);

  try {
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('✅ V2 slash commands registered.');
  } catch (error) {
    console.error('❌ Command registration failed:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.inGuild()) {
    return interaction.reply({
      content: '❌ Use Atomic Builder inside a server.',
      ephemeral: true
    });
  }

  if (!isAdmin(interaction)) {
    return interaction.reply({
      content: '🔒 Administrator permission required.',
      ephemeral: true
    });
  }

  try {

    // CREATE CATEGORY
    if (interaction.commandName === 'add-category') {
      const name = interaction.options.getString('name', true);

      const category = await interaction.guild.channels.create({
        name,
        type: ChannelType.GuildCategory,
        reason: `Atomic Builder: requested by ${interaction.user.tag}`
      });

      return interaction.reply({
        content: `✅ Created category **${category.name}**`,
        ephemeral: true
      });
    }

    // CREATE CHANNEL
    if (interaction.commandName === 'add-channel') {
      const name = interaction.options.getString('name', true);
      const type = interaction.options.getString('type', true);
      const category = interaction.options.getChannel('category');

      const types = {
        text: ChannelType.GuildText,
        voice: ChannelType.GuildVoice,
        forum: ChannelType.GuildForum
      };

      const channel = await interaction.guild.channels.create({
        name,
        type: types[type],
        parent: category?.id ?? null,
        reason: `Atomic Builder: requested by ${interaction.user.tag}`
      });

      return interaction.reply({
        content: `✅ Created ${channel}`,
        ephemeral: true
      });
    }

    // CREATE ROLE
    if (interaction.commandName === 'add-role') {
      const name = interaction.options.getString('name', true);

      const role = await interaction.guild.roles.create({
        name,
        reason: `Atomic Builder: requested by ${interaction.user.tag}`
      });

      return interaction.reply({
        content: `✅ Created role **${role.name}**`,
        ephemeral: true
      });
    }

    // RENAME CHANNEL
    if (interaction.commandName === 'rename-channel') {
      const channel = interaction.options.getChannel('channel', true);
      const newName = interaction.options.getString('name', true);

      const oldName = channel.name;
      await channel.setName(newName);

      return interaction.reply({
        content: `✅ Renamed **${oldName}** → **${channel.name}**`,
        ephemeral: true
      });
    }

    // MOVE CHANNEL
    if (interaction.commandName === 'move-channel') {
      const channel = interaction.options.getChannel('channel', true);
      const category = interaction.options.getChannel('category', true);

      if (channel.type === ChannelType.GuildCategory) {
        return interaction.reply({
          content: '❌ Categories cannot be moved inside categories.',
          ephemeral: true
        });
      }

      await channel.setParent(category.id);

      return interaction.reply({
        content: `✅ Moved ${channel} into **${category.name}**`,
        ephemeral: true
      });
    }

    // DELETE CHANNEL
    if (interaction.commandName === 'delete-channel') {
      const channel = interaction.options.getChannel('channel', true);
      const confirm = interaction.options.getBoolean('confirm', true);

      if (!confirm) {
        return interaction.reply({
          content: '🛑 Cancelled. Nothing was deleted.',
          ephemeral: true
        });
      }

      const name = channel.name;

      await interaction.reply({
        content: `🗑️ Deleting **${name}**...`,
        ephemeral: true
      });

      await channel.delete(
        `Atomic Builder: requested by ${interaction.user.tag}`
      );

      return;
    }

  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp({
        content: `❌ Couldn't do that: ${error.message}`,
        ephemeral: true
      });
    }

    return interaction.reply({
      content: `❌ Couldn't do that: ${error.message}`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);
