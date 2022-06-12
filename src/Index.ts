// import { NodeOption, PlayerUpdate, ShoukakuOptions, TrackExceptionEvent, WebSocketClosedEvent } from "shoukaku";
import KazagumoTrack from "./Managers/Supports/KazagumoTrack";
import { KazagumoQueue } from "./Managers/Supports/KazagumoQueue";
import KazagumoPlayer from "./Managers/KazagumoPlayer";
// import KazagumoPlayer from "./Managers/KazagumoPlayer";
// import { KazagumoOptions } from "./Modules/Interfaces";
// import { Connector } from "shoukaku/dist/src/connectors/Connector";


export * from "./Kazagumo";
export { KazagumoTrack, KazagumoQueue, KazagumoPlayer };
export * from "./Modules/Interfaces";

export const version = "2.0.0";