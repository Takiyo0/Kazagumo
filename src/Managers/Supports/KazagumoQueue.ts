import { KazagumoTrack } from './KazagumoTrack';
import { KazagumoError } from '../../Modules/Interfaces';

export class KazagumoQueue extends Array<KazagumoTrack> {
  /** Get the size of queue */
  public get size() {
    return this.length;
  }

  /** Get the size of queue including current */
  public get totalSize(): number {
    return this.length + (this.current ? 1 : 0);
  }

  /** Check if the queue is empty or not */
  public get isEmpty() {
    return this.length === 0;
  }

  /** Get the queue's duration */
  public get durationLength() {
    return this.reduce((acc, cur) => acc + (cur.length || 0), 0);
  }

  /** Current playing track */
  public current: KazagumoTrack | undefined | null = null;
  /** Previous playing track */
  public previous: KazagumoTrack | undefined | null = null;

  /**
   * Add track(s) to the queue
   * @param track KazagumoTrack to add
   * @returns KazagumoQueue
   */
  public add(track: KazagumoTrack | KazagumoTrack[]): KazagumoQueue {
    if (Array.isArray(track) && track.some((t) => !(t instanceof KazagumoTrack)))
      throw new KazagumoError(1, 'Track must be an instance of KazagumoTrack');
    if (!Array.isArray(track) && !(track instanceof KazagumoTrack)) track = [track];

    if (!this.current) {
      if (Array.isArray(track)) this.current = track.shift();
      else {
        this.current = track;
        return this;
      }
    }

    if (Array.isArray(track)) for (const t of track) this.push(t);
    else this.push(track);
    // ; Array.isArray(track) ? this.push(...track) : this.push(track);
    return this;
  }

  /**
   * Remove track from the queue
   * @param position Position of the track
   * @returns KazagumoQueue
   */
  public remove(position: number): KazagumoQueue {
    if (position < 0 || position >= this.length)
      throw new KazagumoError(1, 'Position must be between 0 and ' + (this.length - 1));
    this.splice(position, 1);
    return this;
  }

  /** Shuffle the queue */
  public shuffle(): KazagumoQueue {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
  }

  /** Clear the queue */
  public clear(): KazagumoQueue {
    this.splice(0, this.length);
    return this;
  }
}
