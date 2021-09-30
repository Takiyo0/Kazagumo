# Kazagumo

### A [Shoukaku](https://github.com/Deivu/Shoukaku) wrapper with built-in queue system and other features

![Kazagumo](https://i.imgur.com/jfVSvHj.png)
> Kazagumo © Azur Lane

## Features:

✓ Built-in queue system  
✓ Easy to use  
✓ Built-in spotify support  
✓ 💖 cute shipgirl

## Documentations

> [Shoukaku](https://github.com/Deivu/Shoukaku) by [Deivu](https://github.com/Deivu);  https://deivu.github.io/Shoukaku   
> Kazagumo; https://takiyo0.github.io/Kazagumo

## Installation

> npm i kazagumo

## Lavalink installation

> Full tutorial step-by-step with image [here](https://github.com/Weeb-Devs/Laffey/blob/main/readme/LAVALINK_INSTALLATION.md) ©Weeb-Devs, the owner is me tbh   
> System requirements [here](https://github.com/freyacodes/Lavalink#requirements)

## Changes
```javascript
// Search tracks
- this.player.getNode().rest.resolve("ytsearch:never gonna give you up") // Shoukaku
+ this.player.search("never gonna give you up") // Kazagumo
    
// Create a player
- this.player.getNode().joinChannel(...) // Shoukaku
+ this.player.createPlayer(...) // Kazagumo
    
// Add a track to the queue. MUST BE A kazagumoTrack, you can get from <kazagumoPlayer>.search()
+ this.player.players.get("69696969696969").addSong(kazagumoTrack) // Kazagumo

// Play a track
- this.player.players.get("69696969696969").playTrack(shoukakuTrack) // Shoukaku
+ this.player.players.get("69696969696969").play() // Kazagumo, take the first song on queue
+ this.player.players.get("69696969696969").play(kazagumoTrack) // Kazagumo, will unshift current song and forceplay this song

// Pauses or resumes the player. Control from kazagumoPlayer instead of shoukakuPlayer
- this.player.players.get("69696969696969").setPaused(true) // Shoukaku
+ this.player.players.get("69696969696969").setPaused(true) // Kazagumo
    
// Set filters. Access shoukakuPlayer from <kazagumoPlayer>.player
- this.player.players.get("69696969696969").setFilters({lowPass: {smoothing: 2}}) // Shoukaku
+ this.player.players.get("69696969696969").player.setFilters({lowPass: {smoothing: 2}}) // Kazagumo

// Set volume, use Kazagumo's for smoother volume
- this.player.players.get("69696969696969").setVolume(1) // Shoukaku 100% volume
+ this.player.players.get("69696969696969").setVolume(100) // Kazagumo 100% volume
```

## Support
> Kazagumo support server: https://discord.gg/nPPW2Gzqg2 (anywhere lmao)   
> Shoukaku support server: https://discord.gg/FVqbtGu (#development)

## Example

```javascript
const {Client} = require('discord.js');
const Kazagumo = require('kazagumo');

const lavalinkServer = [{name: 'Localhost', url: 'localhost:6996', auth: 'you_weeb_indeed', secure: false}];
const shoukakuOptions = {
    moveOnDisconnect: false,
    resumable: false,
    resumableTimeout: 30,
    reconnectTries: 2,
    restTimeout: 10000
};
const kazagumoOptions = {
    spotify: {clientId: "client_id_here_owo", clientSecret: "client_secret_here_owo"},
    defaultSearchEngine: "youtube"
};

class example extends Client {
    constructor() {
        super(options);
        this.kazagumo = new Kazagumo(this, lavalinkServer, shoukakuOptions, kazagumoOptions);
        
        // Listen
        this.on('ready', () => console.log(`${this.user.tag} is now ready!`));

        this.kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink ${name}: Ready!`));
        this.kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error));
        this.kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
        this.kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
            if (moved) return;
            players.map(player => player.connection.disconnect())
            console.warn(`Lavalink ${name}: Disconnected`);
        });
        
        this.kazagumo.on("playerStart", (player, track) => {
            this.channels.cache.get(player.text)?.send({content: `Now playing ${track.title} by ${track.author} [<@!${track.requester}>]`})
                .then(x => player.data.set("message", x));
        });
        this.kazagumo.on("playerEnd", player => {
            if(player.data.get("message") && !player.data.get("message").deleted) player.data.get("message").delete().catch(() => null);
        });
        this.kazagumo.on("playerEmpty", player => {
            if(player.data.get("message") && !player.data.get("message").deleted) player.data.get("message").delete().catch(() => null);
            this.channels.cache.get(player.text)?.send({content: "There's no queue left"});
            player.destroy();
        })

        this.on("messageCreate", async message => {
            if (message.author.bot || !message.guild) return;


            if (message.content.toLowerCase().includes("!play")) {
                const url = message.content.substr(5);
                if (!url) return message.reply({content: "Provide query"});
                const player = await this.kazagumo.createPlayer({
                    guildId: message.guild.id,
                    voiceId: message.member.voice.channel.id,
                    textId: message.channel.id
                })
                const result = await player.search(url, message.author);
                if (!result.tracks.length) return message.reply({content: "No result was found"})
                const tracks = result.tracks;

                if (result.type === "PLAYLIST") for (let track of tracks) player.addSong(track);
                else player.addSong(tracks[0]);
                if (!player.current) player.play();
                return message.reply({content: result.type === "PLAYLIST" ? `Queued ${tracks.length} from ${result.playlistName}` : `Queued ${tracks[0].title}`})
            }
        })
    }
    
    login(TOKEN) {
        return super.login(TOKEN)
    }
}

new example().login("YOUR_LOVELY_BOT_TOKEN_HERE")
```

## Contributors
> - Deivu as the owner of Shoukaku   
>   &nbsp;&nbsp;&nbsp;&nbsp; Github: https://github.com/Deivu    
>   &nbsp;
> - Takiyo as the owner of this project   
>   &nbsp;&nbsp;&nbsp;&nbsp; Github: https://github.com/Takiyo