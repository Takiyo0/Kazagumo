// import { NodeOption, PlayerUpdate, ShoukakuOptions, TrackExceptionEvent, WebSocketClosedEvent } from "shoukaku";
import { KazagumoTrack } from './Managers/Supports/KazagumoTrack';
import { KazagumoQueue } from './Managers/Supports/KazagumoQueue';
import { KazagumoPlayer } from './Managers/KazagumoPlayer';
import Plugins from './Modules/Plugins';
// import KazagumoPlayer from "./Managers/KazagumoPlayer";
// import { KazagumoOptions } from "./Modules/Interfaces";
// import { Connector } from "shoukaku/dist/src/connectors/Connector";

export * from './Kazagumo';
export { KazagumoTrack, KazagumoQueue, KazagumoPlayer, Plugins };
export * from './Modules/Interfaces';

export const version = '3.4.1';
