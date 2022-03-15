import Collection from '@discordjs/collection';
import {
  APIChannel,
  APIGuild,
  APIGuildChannel,
  APIMessage,
} from 'discord-api-types/v9';
import { ChannelType } from 'discord.js';

export class DataStore {
  private readonly guilds: Collection<string, APIGuild> = new Collection();
  private readonly messages: Collection<string, APIMessage> = new Collection();
  private readonly channels: Collection<string, APIChannel> = new Collection();

  public addGuild(guild: APIGuild) {
    this.guilds.set(guild.id, guild);
    guild.channels?.forEach((channel) =>
      this.channels.set(channel.id, channel)
    );
  }

  public addChannel(channel: APIGuildChannel<ChannelType>) {
    if (channel.guild_id) {
      const guild = this.guilds.get(channel.guild_id);
      guild?.channels?.push(channel);
      return;
    }

    this.channels.set(channel.id, channel);
  }

  public addMessage(message: APIMessage) {
    this.messages.set(message.id, message);
  }
}
