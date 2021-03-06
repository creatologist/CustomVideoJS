# [CustomVideoJS](http://ChristopherMil.es/custom-videojs)
Customize your own HTML5 video player! CustomVideoJS is built on top of [Video.js](http://videojs.com)

### View Examples
[http://christophermil.es/github/custom-videojs](http://ChristopherMil.es/github/custom-videojs)
```
02/14/2014
   This repo is under development. Working on cleaning everything up and getting all example cases up.
   Flash fallback tested and works down to IE8.
```

### Easy Implementation
```javascript
var videoPlayer = new CustomVideoJS( 'video-player' );
    
    // add what formats you have, if the browser is missing the right format it'll use flash fallback
    videoPlayer.mp4( 'http://video-js.zencoder.com/oceans-clip.mp4' );
    videoPlayer.webm( 'http://video-js.zencoder.com/oceans-clip.webm' );
    videoPlayer.ogv( 'http://video-js.zencoder.com/oceans-clip.ogv' );
    
    // use flash player if you want
    // videoPlayer.flash = true;
    // videoPlayer.flash_bgcolor = '#79accd';
    
    videoPlayer.create({
		inject: '#video-player-container',
		
		// event listeners
		play: function( player ) {...},
		pause: function( player ) {...},
		ready: function( player ) {...},
		buffering: function( player ) {...},
		playing: function( player ) {...},
		finishedPlaying: function( player ) {...}
	});
```
### Cue Markers + Segments
```javascript
// marker + segment event listeners
+ hit: function( player, marker ) {...}
+ hitFirst: function( player, marker ) {...}
+ scrubbedOn: function( player, marker ) {...}
+ scrubbedOff: function( player, marker ) {...}
+ scrubbedOnDrop: function( player, marker ) {...}
```
```javascript
	
	// x > 1 = time based
	// x < 1 = percentage based
	videoPlayer.addMarker( 6.2, {
		foo: 'bar',
		hit: function( player, marker ) {
			console.log( marker.foo ); // bar
		}
	});
	
	// startTime, endTime, options
	videoPlayer.addSegment( 2, 10, {
		year: 2009,
		scrubbedOn: function( player, marker ) {...},
		scrubbedOff: function( player, marker ) {...}
	});
	
	// endTime, options - add to end of last segment
	videoPlayer.addNextSegment( 14, {
		title: 'Hello World',
		hitFirst: function( player, marker ) {...}
	});
	
```
