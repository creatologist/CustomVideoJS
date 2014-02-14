# CustomVideoJS
Customize your own HTML5 video player!
> CustomVideoJS is built on top of [Video.js](http://videojs.com) 

## Easy Implementation
```javascript
var videoPlayer = new CustomVideoJS( 'video-player' );
    
    videoPlayer.mp4( 'http://video-js.zencoder.com/oceans-clip.mp4' );
    videoPlayer.webm( 'http://video-js.zencoder.com/oceans-clip.webm' );
    videoPlayer.ogv( 'http://video-js.zencoder.com/oceans-clip.ogv' );
    
    videoPlayer.create({
		inject: '#video-player-container',
		playPauseBtn: '#play-pause-btn',
		
		play: function( player ) {...},
		pause: function( player ) {...},
		ready: function( player ) {...},
		buffering: function( player ) {...},
		playing: function( player ) {...},
		finishedPlaying: function( player ) {...}
	});
```
