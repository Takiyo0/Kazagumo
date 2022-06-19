import { Kazagumo, Events } from '../Index';
import { KazagumoPlugin as Plugin } from '../Modules/Interfaces';

export class KazagumoPlugin extends Plugin {
  /**
   * Kazagumo instance.
   */
  public kazagumo: Kazagumo | null = null;

  /**
   * Initialize the plugin.
   * @param client Discord.Client
   */
  constructor(public client: any) {
    super();
  }

  /**
   * Load the plugin.
   * @param kazagumo Kazagumo
   */
  public load(kazagumo: Kazagumo): void {
    this.kazagumo = kazagumo;
    this.client.on('voiceStateUpdate', this.onVoiceStateUpdate.bind(this));
  }

  /**
   * Unload the plugin.
   */
  public unload(): void {
    this.client.removeListener('voiceStateUpdate', this.onVoiceStateUpdate.bind(this));
    this.kazagumo = null;
  }

  private onVoiceStateUpdate(oldState: any, newState: any): void {
    if (!this.kazagumo || oldState.id !== this.client.user.id) return;

    const newChannelId = newState.channelID || newState.channelId;
    const oldChannelId = oldState.channelID || oldState.channelId;
    const guildId = newState.guild.id;

    const player = this.kazagumo.players.get(guildId);
    if (!player) return;

    let state = 'UNKNOWN';
    if (!oldChannelId && newChannelId) state = 'JOINED';
    else if (oldChannelId && !newChannelId) state = 'LEFT';
    else if (oldChannelId && newChannelId && oldChannelId !== newChannelId) state = 'MOVED';

    if (state === 'UNKNOWN') return;

    this.kazagumo.emit(Events.PlayerMoved, player, state, { oldChannelId, newChannelId });
  }
}
