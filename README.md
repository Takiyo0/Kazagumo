# Kazagumo
#### A [Shoukaku](https://github.com/Deivu/Shoukaku) wrapper with built in queue system 

![AppVeyor](https://img.shields.io/appveyor/build/Takiyo0/kazagumo) ![Downloads](https://img.shields.io/npm/dm/kazagumo) ![npm](https://img.shields.io/npm/v/kazagumo) ![Code Quality](https://api.codiga.io/project/33922/score/svg) ![Code Rating](https://api.codiga.io/project/33922/status/svg) ![GitHub contributors](https://img.shields.io/github/contributors/Takiyo0/Kazagumo) ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Takiyo0/Kazagumo) ![GitHub last commit](https://img.shields.io/github/last-commit/Takiyo0/Kazagumo) ![NPM](https://img.shields.io/npm/l/kazagumo)  

![Kazagumo](https://i.imgur.com/jfVSvHj.png)
> Kazagumo © Azur Lane

## Features:

✓ Built-in queue system  
✓ Easy to use  
✓ Plugin system  
✓ Uses shoukaku v3   
✓ Stable _🙏_   
✓ 💖 cute shipgirl

## Documentation
Pls read the docs before asking 🙏🙏🙏 There is a useful search feature there
> [Shoukaku](https://github.com/Deivu/Shoukaku) by [Deivu](https://github.com/Deivu);  https://deivu.github.io/Shoukaku   
> Kazagumo; https://takiyo0.github.io/Kazagumo

## Installation

> npm i kazagumo

## Metadata

> version: 2.3.2   
> pre-release: false  
> Last build: 01-12-2023 20:08

## Plugins
- Official [spotify plugin](https://npmjs.com/package/kazagumo-spotify)
> npm i kazagumo-spotify

## Lavalink installation

> Full tutorial step-by-step with image [here](https://github.com/Weeb-Devs/Laffey/blob/main/readme/LAVALINK_INSTALLATION.md) ©Weeb-Devs, the owner is me tbh   
> System requirements [here](https://github.com/freyacodes/Lavalink#requirements)

## Changes
```javascript
// You can get ShoukakuPlayer from here
+ <KazagumoPlayer>.shoukaku
+ this.player.players.get("69696969696969").shoukaku

// Search tracks
- this.player.getNode().rest.resolve("ytsearch:pretender Official髭男dism") // Shoukaku
+ this.player.search("pretender Official髭男dism") // Kazagumo
    
// Create a player
- this.player.getNode().joinChannel(...) // Shoukaku
+ this.player.createPlayer(...) // Kazagumo
    
// Add a track to the queue. MUST BE A kazagumoTrack, you can get from <KazagumoPlayer>.search()
+ this.player.players.get("69696969696969").queue.add(kazagumoTrack) // Kazagumo

// Play a track
- this.player.players.get("69696969696969").playTrack(shoukakuTrack) // Shoukaku
+ this.player.players.get("69696969696969").play() // Kazagumo, take the first song on queue
+ this.player.players.get("69696969696969").play(kazagumoTrack) // Kazagumo, will unshift current song and forceplay this song

// Pauses or resumes the player. Control from kazagumoPlayer instead of shoukakuPlayer
- this.player.players.get("69696969696969").setPaused(true) // Shoukaku
+ this.player.players.get("69696969696969").pause(true) // Kazagumo
    
// Set filters. Access shoukakuPlayer from <KazagumoPlayer>.player
- this.player.players.get("69696969696969").setFilters({lowPass: {smoothing: 2}}) // Shoukaku
+ this.player.players.get("69696969696969").shoukaku.setFilters({lowPass: {smoothing: 2}}) // Kazagumo

// Set volume, use Kazagumo's for smoother volume
- this.player.players.get("69696969696969").setVolume(1) // Shoukaku 100% volume
+ this.player.players.get("69696969696969").setVolume(100) // Kazagumo 100% volume

// Skip the current song
- this.player.players.get("69696969696969").stopTrack() // Stoptrack basically skip on shoukaku
+ this.player.players.get("69696969696969").skip() // skip on kazagumo. easier to find :v
```

## Support
⚠️ Please read the docs first before asking question ⚠️ 
> Kazagumo support server: https://discord.gg/nPPW2Gzqg2 (anywhere lmao)   
> Shoukaku support server: https://discord.gg/FVqbtGu (#development)   
> Report if you found a bug here https://github.com/Takiyo0/Kazagumo/issues/new/choose

## Enable playerMoved event
```javascript
import { Kazagumo, Payload, Plugins } from "kazagumo";

const kazagumo = new Kazagumo({
    ...,
    plugins: [new Plugins.PlayerMoved(client)]
}, Connector, Nodes, ShoukakuOptions)
```

## Example bot
```javascript
const {Client, GatewayIntentBits} = require('discord.js');
const {Guilds, GuildVoiceStates, GuildMessages, MessageContent} = GatewayIntentBits;
const {Connectors} = require("shoukaku");
const {Kazagumo, KazagumoTrack} = require("../dist");

const Nodes = [{
    name: 'owo',
    url: 'localhost:2333',
    auth: 'youshallnotpass',
    secure: false
}];
const client = new Client({intents: [Guilds, GuildVoiceStates, GuildMessages, MessageContent]});
const kazagumo = new Kazagumo({
    defaultSearchEngine: "youtube",
    // MAKE SURE YOU HAVE THIS
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    }
}, new Connectors.DiscordJS(client), Nodes);

client.on("ready", () => console.log(client.user.tag + " Ready!"));

kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink ${name}: Ready!`));
kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error));
kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
kazagumo.shoukaku.on('debug', (name, info) => console.debug(`Lavalink ${name}: Debug,`, info));
kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
    if (moved) return;
    players.map(player => player.connection.disconnect())
    console.warn(`Lavalink ${name}: Disconnected`);
});

kazagumo.on("playerStart", (player, track) => {
    client.channels.cache.get(player.textId)?.send({content: `Now playing **${track.title}** by **${track.author}**`})
        .then(x => player.data.set("message", x));
});

kazagumo.on("playerEnd", (player) => {
    player.data.get("message")?.edit({content: `Finished playing`});
});

kazagumo.on("playerEmpty", player => {
    client.channels.cache.get(player.textId)?.send({content: `Destroyed player due to inactivity.`})
        .then(x => player.data.set("message", x));
    player.destroy();
});

client.on("messageCreate", async msg => {
    if (msg.author.bot) return;

    if (msg.content.startsWith("!play")) {
        const args = msg.content.split(" ");
        const query = args.slice(1).join(" ");

        const {channel} = msg.member.voice;
        if (!channel) return msg.reply("You need to be in a voice channel to use this command!");

        let player = await kazagumo.createPlayer({
            guildId: msg.guild.id,
            textId: msg.channel.id,
            voiceId: channel.id,
            volume: 40
        })

        let result = await kazagumo.search(query, {requester: msg.author});
        if (!result.tracks.length) return msg.reply("No results found!");

        if (result.type === "PLAYLIST") for (let track of result.tracks) player.queue.add(track);
        else player.queue.add(result.tracks[0]);

        if (!player.playing && !player.paused) player.play();
        return msg.reply({content: result.type === "PLAYLIST" ? `Queued ${result.tracks.length} from ${result.playlistName}` : `Queued ${result.tracks[0].title}`});
    }

    if (msg.content.startsWith("!forceplay")) {
        let player = kazagumo.players.get(msg.guild.id);
        if (!player) return msg.reply("No player found!");
        const args = msg.content.split(" ");
        const query = args.slice(1).join(" ");
        let result = await kazagumo.search(query, {requester: msg.author});
        if (!result.tracks.length) return msg.reply("No results found!");
        player.play(new KazagumoTrack(result.tracks[0].getRaw(), msg.author));
        return msg.reply({content: `Forced playing **${result.tracks[0].title}** by **${result.tracks[0].author}**`});
    }
})


client.login('');
```

## Known issue
###### This part should be in kazagumo-spotify but whatever
- Force playing song from spotify module (player.play(result.tracks[0]); `result.tracks[0]` is from spotify) is currently not working. **ONLY WHEN YOU DO player.play(thing), NOT player.play() OR player.queue.add(new KazagumoTrack(...))** Please use this workaround
```js
    const { KazagumoTrack } = require("kazagumo"); // CommonJS
    import { KazagumoTrack } from "kazagumo"; // ES6; don't laugh if it's wrong

    let track = result.tracks[0] // the spotify track
    let convertedTrack = new KazagumoTrack(track.getRaw(), track.author);
    player.play(convertedTrack);
```

## Contributors
> - Deivu as the owner of Shoukaku   
>   &nbsp;&nbsp;&nbsp;&nbsp; Github: https://github.com/Deivu    
>   &nbsp;
> - Takiyo as the owner of this project   
>   &nbsp;&nbsp;&nbsp;&nbsp; Github: https://github.com/Takiyo0
