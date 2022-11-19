import { Track } from 'shoukaku';
import { KazagumoTrack } from '../Managers/Supports/KazagumoTrack';

export class KazagumoUtils {
  static convertKazagumoTrackToTrack(track: KazagumoTrack | Track): Track {
    if ((track as Track).info) return track as Track;
    track = track as KazagumoTrack;
    return {
      track: track.track,
      info: {
        isSeekable: track.isSeekable,
        isStream: track.isStream,
        title: track.title,
        uri: track.uri,
        identifier: track.identifier,
        sourceName: track.sourceName,
        author: track.author ?? '',
        length: track.length ?? 0,
        position: track.position ?? 0,
      },
    };
  }
}
