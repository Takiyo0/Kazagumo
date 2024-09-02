# Kazagumo
#### A [Shoukaku](https://github.com/Deivu/Shoukaku) wrapper with built in queue system 

![AppVeyor](https://img.shields.io/appveyor/build/Takiyo0/kazagumo) ![Downloads](https://img.shields.io/npm/dm/kazagumo) ![npm](https://img.shields.io/npm/v/kazagumo) ![GitHub contributors](https://img.shields.io/github/contributors/Takiyo0/Kazagumo) ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Takiyo0/Kazagumo) ![GitHub last commit](https://img.shields.io/github/last-commit/Takiyo0/Kazagumo) ![NPM](https://img.shields.io/npm/l/kazagumo)  

![Kazagumo](https://i.imgur.com/jfVSvHj.png)
> Kazagumo © Azur Lane

## Features:

✓ Built-in queue system  
✓ Easy to use  
✓ Plugin system  
✓ Uses shoukaku v4 + capable of Lavalink v4   
✓ Stable _🙏_   

## Note
⚠️Please check [Environment](#environment) that Kazagumo 3.2.0 is verified working on. It's recommended to use the latest version of lavalink. If you encounter any problem, try using previous [version](https://www.npmjs.com/package/kazagumo/v/3.1.2). If issue still persist, please [open an issue](https://github.com/Takiyo0/Kazagumo/issues) or ask me in [Discord](https://discord.gg/nPPW2Gzqg2) (I will answer if I have time) ⚠️

## Documentation
Please read the docs first before asking methods
> Kazagumo; https://takiyo0.github.io/Kazagumo    
> [Shoukaku](https://github.com/Deivu/Shoukaku) by [Deivu](https://github.com/Deivu);  https://deivu.github.io/Shoukaku   

## Installation

> npm i kazagumo

## Metadata

> version: 3.2.1  
> pre-release: false  
> Last build: 9-2-2024 22.13 PM

## Environment
The new lavalink system that separate YouTube plugins made configuration a bit harder. I will list all working environment that's known working.

| Environment                                  | Case 1                                                                                                                      | Case 2                                                                                                                                      | Case 3                                                                      |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| Lavalink Version                             | v4.0.7                                                                                                                      | v4.0.7                                                                                                                                      | v4.0.7                                                                      |
| Youtube Plugin Version                       | v1.7.2                                                                                                                      | v1.7.2                                                                                                                                      | none                                                                        |
| [LavaSrc](https://google.com) Plugin Version | v4.1.1                                                                                                                      | v4.1.1                                                                                                                                      | v4.1.1                                                                      |
| Kazagumo Version                             | v3.2.0                                                                                                                      | v3.2.0                                                                                                                                      | v3.2.0                                                                      |
| Shoukaku Version                             | v4.1.0 (built-in v3.2.0)                                                                                                    | v4.1.0 (built-in v3.2.0)                                                                                                                    | v4.1.0 (built-in v3.2.0)                                                    |
| Youtube Plugin Config                        | youtube.oauth.enabled = true<br>youtube.oauth.accessToken = "filled"<br>youtube.oauth.clients = MUSIC,ANDROID_TESTSUITE,WEB | youtube.oauth.enabled = true<br>youtube.oauth.accessToken = "filled"<br>youtube.oauth.clients = MUSIC,ANDROID_TESTSUITE,WEB,TVHTML5EMBEDDED | none                                                                        |
| Lavalink Config                              | server.sources.youtube = false<br>server.sources.youtubeSearchEnabled = false                                               | server.sources.youtube = false<br>server.sources.youtubeSearchEnabled = false                                                               | server.sources.youtube = true<br>server.sources.youtubeSearchEnabled = true |
| LavaSrc Config                               | lavasrc.sources.youtube = true                                                                                              | lavasrc.sources.youtube = true                                                                                                              | lavasrc.sources.youtube = true                                              |
| **Result**                                   |                                                                                                                             |                                                                                                                                             |                                                                             |
| YouTube Playlist Load*                       | ✅                                                                                                                           | ❌                                                                                                                                           | ✅                                                                           |
| YouTube Track Load                           | ✅                                                                                                                           | ✅                                                                                                                                           | ❌                                                                           |
| YouTube Search                               | ✅                                                                                                                           | ✅                                                                                                                                           | ✅                                                                           |
| LavaSrc Spotify Playlist Load                | ✅                                                                                                                           | ✅                                                                                                                                           | ✅                                                                           |
| LavaSrc Spotify Track Load                   | ✅                                                                                                                           | ✅                                                                                                                                           | ✅                                                                           |
| LavaSrc Spotify Search (spsearch:query)**    | ✅                                                                                                                           | ✅                                                                                                                                           | ✅                                                                           |
| **Summary**                                  | ✅ works just fine                                                                                                           | ➖ cannot load youtube playlist                                                                                                              | ❌ cannot play any track youtube related. including spotify                  |

Note:
- `*` = youtube playlist load with YouTube plugin requires oauth enabled and accessToken filled and `TVHTML5EMBEDDED` to be removed from oauth clients, since it's the default config
- `**` = to do that, you need to add `source` option into `SearchOptions`. Example: `kazagumo.search(query, {source: "spsearch:"});` (⚠️you need to include `:` in the last of `spsearch` or anything to replace source)

## Plugins
- Official [spotify plugin](https://npmjs.com/package/kazagumo-spotify)
> npm i kazagumo-spotify
  - Additional [apple plugin](https://www.npmjs.com/package/kazagumo-apple)
> npm i kazagumo-apple
- Additional [filter plugin](https://www.npmjs.com/package/kazagumo-filter)
> npm i kazagumo-filter
- Additional [nicovideo.jp plugin](https://www.npmjs.com/package/kazagumo-nico)
> npm i kazagumo-nico
- Additional [deezer plugin](https://www.npmjs.com/package/kazagumo-deezer)
> npm i kazagumo-deezer
- Stone-Deezer [deezer plugin](https://www.npmjs.com/package/stone-deezer)
> npm i stone-deezer

## Lavalink installation
> Basically you can follow this [Official Step](https://lavalink.dev/getting-started/index.html)


## Changes v2 -> v3
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
        
// Play previous song
+ this.player.players.get("69696969696969").play(this.player.players.get("69696969696969").getPrevious()) // Kazagumo, make sure it's not undefined first        

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
kazagumo.shoukaku.on('disconnect', (name, count) => {
    const players = [...kazagumo.shoukaku.players.values()].filter(p => p.node.name === name);
    players.map(player => {
        kazagumo.destroyPlayer(player.guildId);
        player.destroy();
    });
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

        if (result.type === "PLAYLIST") player.queue.add(result.tracks); // do this instead of using for loop if you want queueUpdate not spammy
        else player.queue.add(result.tracks[0]);

        if (!player.playing && !player.paused) player.play();
        return msg.reply({content: result.type === "PLAYLIST" ? `Queued ${result.tracks.length} from ${result.playlistName}` : `Queued ${result.tracks[0].title}`});
    }

    if (msg.content.startsWith("!skip")) {
        let player = kazagumo.players.get(msg.guild.id);
        if (!player) return msg.reply("No player found!");
        player.skip();
        log(msg.guild.id);
        return msg.reply({content: `Skipped to **${player.queue[0]?.title}** by **${player.queue[0]?.author}**`});
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

    if (msg.content.startsWith("!previous")) {
        let player = kazagumo.players.get(msg.guild.id);
        if (!player) return msg.reply("No player found!");
        const previous = player.getPrevious(); // we get the previous track without removing it first
        if (!previous) return msg.reply("No previous track found!");
        await player.play(player.getPrevious(true)); // now we remove the previous track and play it
        return msg.reply("Previous!");
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
    let convertedTrack = new KazagumoTrack(track.getRaw()._raw, track.author);
    player.play(convertedTrack);
```

## Contributors
> - Deivu as the owner of Shoukaku   
>   &nbsp;&nbsp;&nbsp;&nbsp; Github: https://github.com/Deivu    
>   &nbsp;
> - Takiyo as the owner of this project   
>   &nbsp;&nbsp;&nbsp;&nbsp; Github: https://github.com/Takiyo0
