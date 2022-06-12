import KazagumoTrack from './KazagumoTrack';
import { KazagumoError } from '../../Modules/Interfaces';

export class KazagumoQueue extends Array<KazagumoTrack> {
  public get size() {
    return this.length;
  }

  public get totalSize(): number {
    return this.length + (this.current ? 1 : 0);
  }

  public get isEmpty() {
    return this.length === 0;
  }

  public get durationLength() {
    return this.reduce((acc, cur) => acc + (cur.length || 0), 0);
  }

  public current: KazagumoTrack | undefined | null = null;
  public previous: KazagumoTrack | undefined | null = null;

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

  public remove(position: number): KazagumoQueue {
    if (position < 0 || position >= this.length)
      throw new KazagumoError(1, 'Position must be between 0 and ' + (this.length - 1));
    this.splice(position, 1);
    return this;
  }

  public shuffle(): KazagumoQueue {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
  }

  public clear(): KazagumoQueue {
    this.splice(0, this.length);
    return this;
  }
}
