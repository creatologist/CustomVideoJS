/*	
		=========================================================================================
 		*
		*	CustomVideoJS
 		*
 		=========================================================================================
		*----------------------------------------------------------------------------------------
 		*
 		*	Video.js - easier and highly customizable
 		*
 		=========================================================================================
		*
		*   author          >>  Christopher Miles
		* 
		*   site            >>  http://ChristopherMil.es
		*   github          >>  http://github.com/creatologist
		*
		=========================================================================================
*/

//===============================================================================================
//----------------------------------------------------------------------------------------------- DO IT


var CustomVideoJS = function( id ) {
	
	if ( window ) {
		window.PLAYBACK_SPEED = {
			HALF			: 0.5,
			NORMAL			: 1.0,
			DOUBLE			: 2.0,
			FASTEST			: 4.0,
			REVERSE			: 1.0,
			REVERSE_HALF	: 0.5
		};
	}
	
	//
	
	this.id 				= id;
	this.options 			= null;
	
	this.width				= '400px';
	this.height				= '300px';
	
	this.flash				= false;
	this.flash_bgcolor		= '#000000';
	
	this.MOBILE				= false;
	this.INIT				= false;
	
	this.autoplay			= false;
	
	//
	
	this.duration			= 0;
	this.volume				= 1;
	
	this.percentLoaded		= 0;
	
	this.playbackRate		= 1.0;
	
	this.currentPercent		= 0;
	this.currentTime		= 0;
	
	this.playing			= false;
	this.userAction			= false;
	
	this.scrubberOptions	= {};
	this.scrubbing			= false;
	this.$_scrubber			= null;
	
	//
	
	this.ready				= false;
	this.player				= null;
	this.flash_player		= null;
	this.video				= null;
	
	this.videoTypes			= {
		'video/mp4'			: false,
		'video/webm' 		: false,
		'video/ogg' 		: false
	};
	
	this.mp4				= function ( s ) {
		this.videoTypes[ 'video/mp4' ] = s;
	};
	
	this.webm				= function ( s ) {
		this.videoTypes[ 'video/webm' ] = s;
	};
	
	this.ogg				= function ( s ) {
		this.videoTypes[ 'video/ogv' ] = s;
	};
	
	this.ogv				= function ( s ) {
		this.videoTypes[ 'video/ogv' ] = s;
	};
	
	//
	
	this.markers			= [];
	this.markersReady		= false;
	
	this.onMarker			= false;
	this._onMarker			= false;
	
	//
	
	this.segments			= [];
	
	//
	
	this.html				= function() {
		
		var h = "<video id='" + this.id + "' class='video-js vjs-default-skin' preload='auto' width='";
			h += this.width + "' height='";
			h += this.height + "'>";
		
		for ( key in this.videoTypes ) {
    		if ( this.videoTypes[ key ] !== false ) h += "<source src='" + this.videoTypes[ key ] + "' type='" + key + "' />";
    	}
    	
    		h += "</video>";
		
		return h;
	};
	
	this.create				= function( options ) {
		
		this.say = function( msg ) {
        	if ( console && console.log ) {
        		console.log( '[CustomVideoJS] ' + msg );
        	}
        };
		
		var self = this;
		this.options = options || {};
		
		console.log( options );
		
		if ( options.inject ) {
			$( options.inject ).html( this.html() );
		}
		
		var html5Video = false;
   		var v = document.createElement('video');
   
	    if( v.canPlayType ) {
	    	for ( key in this.videoTypes ) {
	    		if ( this.videoTypes[ key ] !== false && v.canPlayType( key ).replace(/no/, '') ) html5Video = true;
	    	}
	    }
	    
	    if ( !html5Video ) this.flash = true;
		
		if ( videojs._CustomVideoJS_IS_MOBILE != undefined ) {
			this.MOBILE = videojs._CustomVideoJS_IS_MOBILE;
		} else {
			this.MOBILE = videojs.TOUCH_ENABLED;
			videojs._CustomVideoJS_IS_MOBILE = videojs.TOUCH_ENABLED;
			videojs.TOUCH_ENABLED = false;
		}
		
		if ( options.flashSWF ) videojs.options.flash.swf = options.flashSWF;
		videojs.options.autoplay = this.autoplay;
		videojs.options.flash.autoplay = this.autoplay;
		
		//
		
		this.handle.customVideoJS = this;
		
		//$( '#' + this.id ).css( 'display', 'none' );
		
		if ( this.flash ) {
			
			videojs.options.techOrder = [ 'flash' ];
			videojs.options.flash.params = { bgcolor: this.flash_bgcolor };

			videojs( this.id ).ready( function() {
				
				self.say( 'Flash Player' );
				
				self.flash_player = document[ self.id + '_flash_api' ];
				
				self.get = function( id ) {
					return self.flash_player.vjs_getProperty( id );
				};
				
				self.set = function( id ) {
					return self.flash_player.vjs_setProperty( id );
				};
				
				self.duration = self.get( 'duration' );
				
				self.player = this;
				self.player.customVideoJS = self;
				self._addFlashListeners();
				
				self.INIT = true;
				self.handle.ready();
				
			}).error( function() {
				self.say( 'ERROR - Flash Player' );
			});
		} else {
			self.say( 'HTML5 Player' );
			
			videojs( this.id ).ready( function() {
				self.player = this;
				self.player.customVideoJS = self;
				self.INIT = true;
				self.handle.ready();
			});
			
			//this.player = videojs( this.id, { nativeControlsForTouch: false, bigPlayButton: false });
			//this.player.customVideoJS = this;
			
			/*setTimeout( function() {
				
				if ( !self.MOBILE ) {
					self.play();
					setTimeout( function() { self.pause(); self.INIT = true; self.handle.ready(); }, 1 );
				} else {
					self.INIT = true;
					self.handle.ready();
				}
				
				
			}, 1000 );*/
		}
		
		$( '.vjs-loading-spinner, .vjs-text-track-display, .vjs-big-play-button, .vjs-control-bar' ).remove();
		
		//
		
		this.play = function() {
			if ( !self.player ) return;
			self.userAction = true;
			self.player.play();
		};
		
		this.stop = function() {
			if ( !self.player ) return;
			self.userAction = true;
			self.player.pause();
		};
		
		this.pause = function() {
			if ( !self.player ) return;
			self.userAction = true;
			self.player.pause();
		};
		
		this.reset = function() {
			if ( !self.player ) return;
			self.userAction = true;
			self.seekToTime( 0 );
			self.player.pause();
		};
		
		this.setVolume = function( v ) {
			if ( !self.player ) return;
			if ( v < 0 ) {
				self.say( 'volume MIN = 0.0' );
				v = 0;
			} else if ( v > 1 ) {
				self.say( 'volume MAX = 1.0' );
				v = 1;
			}
			self.volume = v;
			
			if ( self.flash ) self.set( 'volume', self.volume );
			else self.player.volume( v );
		};
		
		this.seekToPercent = function( t ) {
			if ( !self.player ) return;
			//console.log( t );
			if ( t > 1 ) {
				self.say( 'seekToPercent MAX = 1.0' );
				return;
			}
			self.currentPercent = t;
			self.currentTime = t * self.duration;
			
			self.player.currentTime( self.currentTime );
			if ( self.flash ) {
				self.play();
				self.pause();
			}
		};
		
		this.seekToTime = function( t ) {
			if ( !self.player ) return;
			if ( t > self.duration ) {
				self.say( 'seekToTime MAX = video duration' );
				return;
			}
			self.currentTime = t;
			self.currentPercent = t / self.duration;
			
			self.player.currentTime( t );
			if ( self.flash ) {
				self.play();
				self.pause();
			}
		};
		
		this.togglePlayPause = function() {
			self.handle.togglePlayPause();
		};
		
		this.playbackRate = function( r ) {
			
			if ( self.flash ) {
				self.say( 'WARNING: playbackRate not available flash player' );
			} else {
				if ( !self.video ) return;
				if ( r > 4 ) self.say( 'WARNING: audio might not work if playbackRate > 4' );
				this.playbackRate = r;
				self.video.playbackRate = r;
			}
			
		};
		
		$( '.vjs-big-play-button' ).css( 'display', 'none' );
		$( '.vjs-control-bar' ).css( 'display', 'none' );
		
		$( window ).resize( function() {
			self.handle.resize( self );
		});
		
		if ( this.options.playPauseBtn ) $( this.options.playPauseBtn ).click( function() {
			self.handle.togglePlayPause();
		} );
		
        if ( !this.flash ) this._addListeners();
        
	};
	
	this._addFlashListeners = function() {
		var self = this;
		
		this.player.on( 'play', this.handle.play );
		this.player.on( 'pause', this.handle.pause );
		this.player.on( 'ended', this.handle.ended );
		
		this.player.on( 'timeupdate', function( e ) {
			//console.log( 'timeupdate' );
			if ( self.scrubbing ) return;
			
			self.currentTime = self.get( 'currentTime' );
			self.currentPercent = self.currentTime / self.duration;
			
			if ( isNaN( self.currentPercent ) ) return;
			
			if ( self.currentPercent > .99 ) {
				self.currentPercent = 1;
				self.currentTime = self.duration;
			}
			
			self.handle.playing();
			
			if ( !self.markersReady && self.currentPercent != 0 ) {
        		
        		for ( var i = 0, len = self.markers.length; i < len; i ++ ) {
        			self.markers[i].init( self.currentPercent, self.duration );
        		}
        		self.markersReady = true;
        	}
			
			//console.log( e );
			//console.log( e.target.vjs_getProperty( 'currentTime' ) );
			//console.log(  )
		});
		
		this.player.on( 'progress', function( e ) {
			self.duration = self.get( 'duration' );
			var b = self.get( 'buffered' );
			var bt = self.get( 'bytesTotal' );
			var t = self.flash_player.vjs_getProperty( 'bufferedBytesEnd' );
			console.log( b, bt, t, b/t );
			
			self.percentLoaded = 1;
			self.handle.buffering();
			
			return;
			
			if ( e.target.buffered.length < 1 ) return;
        	
        	self.percentLoaded = e.target.buffered.end( 0 ) / e.target.duration;
        	if ( self.percentLoaded > .99 ) self.percentLoaded = 1;
        	
        	self.handle.buffering();
		});
		
	};
	
	this._addListeners = function() {
		var self = this;
		
		//
		
		this.player.on( 'play', this.handle.play );
		this.player.on( 'pause', this.handle.pause );
		this.player.on( 'ended', this.handle.ended );
		//this.player.on( 'resize', function() { console.log( 'resize' ) } );
		
		//
		
		this.player.on( 'timeupdate', function( e ) {
			//console.log( 'timeupdate' );
			//console.log( e );
			if ( self.scrubbing ) return;
			
			//console.log( e.currentTime, e.target.currentTime, e.target.duration );
			
			self.currentPercent = e.target.currentTime / e.target.duration;
			if ( isNaN( self.currentPercent ) ) return;
			
			if ( self.currentPercent > .99 ) {
				self.currentPercent = 1;
				self.currentTime = e.target.duration;
			} else {
				self.currentTime = e.target.currentTime;
			}
			
			self.handle.playing();
			
			if ( !self.markersReady && self.currentPercent != 0 ) {
        		
        		for ( var i = 0, len = self.markers.length; i < len; i ++ ) {
        			self.markers[i].init( self.currentPercent, e.target.duration );
        		}
        		self.markersReady = true;
        	}
		});
		
        this.player.on( 'progress', function( e ) {
        	//console.log( 'progress' );
        	//console.log( e ); 
        	if ( e.target.buffered.length < 1 ) return;
        	
        	self.percentLoaded = e.target.buffered.end( 0 ) / e.target.duration;
        	if ( self.percentLoaded > .99 ) self.percentLoaded = 1;
        	
        	self.handle.buffering();
        });
        
        this.player.on( 'durationchange', function( e ) {
        	self.duration = e.target.duration;
        	self.video = e.target;
        });
		
	};
	
	this.addMarker = function( time, options ) {
		
		var m = new CustomVideoJSMarker( time, options, this );
		
		this.markers.push( m );
		
	};
	
	this.addSegment	= function( startTime, endTime, options ) {
		
		var s = new CustomVideoJSSegment( startTime, endTime, options, this );
		
		this.segments.push( s );
		
	};
	
	this.addNextSegment	= function( endTime, options ) {
		
		var prevEnd = this.segments[ this.segments.length - 1 ].endTime + .001;
		//console.log( prevEnd );
		var s = new CustomVideoJSSegment( prevEnd, endTime, options, this );
		
		this.segments.push( s );
		
	};
	
	this.scrubber = function( el, options ) {
		
		options._scrubbedOn = false;
		
		this.scrubberOptions = options;
		
		var self = this;
		
		this.$_scrubber = $( el );
		
		if ( options.start ) {
			this.scrubberOptions._start = this.scrubberOptions.start;
			this.scrubberOptions.start = function( event, ui ) {
				if ( self.MOBILE && !self.ready ) {
					self.$_scrubber.trigger( 'mouseup' );
					setTimeout( function() { self.$_scrubber.css( ui.originalPosition ); }, 1 );
					return;
				}
				self.pause();
				self.scrubbing = true;
				self.onMarker = false;
				self.scrubberOptions._start();
			};
		} else {
			this.scrubberOptions.start = function( event, ui ) {
				if ( self.MOBILE && !self.ready ) {
					self.$_scrubber.trigger( 'mouseup' );
					setTimeout( function() { self.$_scrubber.css( ui.originalPosition ); }, 1 );
					return;
				}
				self.pause();
				self.scrubbing = true;
				self.onMarker = false;
			};
		}
		
		if ( options.drag ) {
			this.scrubberOptions._drag = this.scrubberOptions.drag;
			this.scrubberOptions.drag = function() {
				if ( !self.ready ) return;
				self.scrubberOptions._drag();
				
				for ( var i = 0, len = self.segments.length; i < len; i++ ) {
					self.segments[ i ].checkScrub( self );
				}
				
				if ( self.markersReady ) {
					self.onMarker = false;
					
					for ( var i = 0, len = self.markers.length; i < len; i ++ ) {
						 self.markers[i].checkScrub( self );
					}
					
					if ( !self.onMarker && self._onMarker ) {
						self._onMarker = false;
						if ( self.scrubberOptions.offMarker ) self.scrubberOptions.offMarker( self );
					}
				}
			};
		} else {
			this.scrubberOptions.drag = function() {
				if ( !self.ready ) return;
				
				for ( var i = 0, len = self.segments.length; i < len; i++ ) {
					self.segments[ i ].checkScrub( self );
				}
				
				if ( self.markersReady ) {
					self.onMarker = false;
					
					for ( var i = 0, len = self.markers.length; i < len; i ++ ) {
						 self.markers[i].checkScrub( self );
					}
					
					if ( !self.onMarker && self._onMarker ) {
						self._onMarker = false;
						if ( self.scrubberOptions.offMarker ) self.scrubberOptions.offMarker( self );
					}
				}
			};
		}
		
		if ( options.stop ) {
			this.scrubberOptions._stop = this.scrubberOptions.stop;
			this.scrubberOptions.stop = function() {
				if ( !self.ready ) return;
				self.scrubbing = false;
				
				for ( var i = 0, len = self.segments.length; i < len; i++ ) {
					self.segments[ i ].checkScrub( self, true );
				}
				
				if ( self.markersReady ) {
					for ( var i = 0, len = self.markers.length; i < len; i ++ ) {
						 self.markers[i].checkScrub( self, true );
					}
				}
				
				self.scrubberOptions._stop();
				if ( !self.playing && !self.userAction ) self.play();
			};
		} else {
			this.scrubberOptions.stop = function() {
				if ( !self.ready ) return;
				self.scrubbing = false;
				
				for ( var i = 0, len = self.segments.length; i < len; i++ ) {
					self.segments[ i ].checkScrub( self, true );
				}
				
				if ( self.markersReady ) {
					for ( var i = 0, len = self.markers.length; i < len; i ++ ) {
						 self.markers[i].checkScrub( self, true );
					}
				}
				
				if ( !self.playing && !self.userAction ) self.play();
			};
		}
		
		this.$_scrubber.draggable( this.scrubberOptions );
		
	};
	
	this.handle = {
		
		ready : function() {
			if ( !this.customVideoJS.ready ) {
				this.customVideoJS.ready = true;
				if ( this.customVideoJS.options.ready ) this.customVideoJS.options.ready( this.customVideoJS );
			}
			
		},
		
		resize : function( self ) {
			if ( self.options.resize ) self.options.resize( self );
		},
		
		init	: function( self ) {
			if ( self.options.init ) self.options.init( self );
		},
		
		playing : function() {
			var c = this.customVideoJS;
			if ( c.options.playing ) c.options.playing( c );
			
			for ( var i = 0, len = c.segments.length; i < len; i++ ) {
				c.segments[ i ].update( c );
			}
			
			if ( !c.markersReady ) return;
			for ( var i = 0, len = c.markers.length; i < len; i++ ) {
				//console.log( c.currentTime );
				c.markers[ i ].update( c );
			}
		},
		
		togglePlayPause : function() {
			
			var c = this.customVideoJS;
				c.userAction = true;
			
			if ( !c.playing ) c.player.play(); 
			else c.player.pause();
			
		},
		
		buffering : function() {
			
			if ( this.customVideoJS.options.buffering ) this.customVideoJS.options.buffering( this.customVideoJS ); 
			
		},
		
		play : function() {
			//console.log( 'play' );
			
			var c = this.customVideoJS;
			
			if ( !c.INIT ) return;
			$( '#' + c.id ).css( 'display', 'block' );
			$( '#' + c.id + '_html5_api' ).css( 'display', 'block' );
			
				c.playing = true;
			
			if ( c.options.play )  c.options.play( c ); 
			
			//Video.player.play();
			c.userAction = false;
		},
		
		pause : function() {
			//console.log( 'pause' );
			
			var c = this.customVideoJS;
			if ( !c.INIT ) return;
				c.playing = false;
			
			//Video.player.pause();
			if ( c.options.pause ) c.options.pause( c );
			
			// buffering - try to keep playing
			if ( !c.userAction && c.percentLoaded != 1 ) c.play();
			
			c.userAction = false;
		},
		
		ended : function() {
			//console.log( 'ended' );
			
			var c = this.customVideoJS;
				c.playing = false;
			
			if ( c.options.finishedPlaying ) c.options.finishedPlaying( c );
			
		}
		
	};
	
	
};

var CustomVideoJSSegment = function( startTime, endTime, options, playerRef ) {
	
	this.startTime		= startTime;
	this.endTime		= endTime;
	
	this.playerRef		= playerRef;
	
	this.percentage		= false;
	if ( options.timeIsPercent != undefined ) this.percentage = options.timeIsPercent;
	
	this._hitFirst 		= false;
	this._hit			= false;
	this._scrubbedOn	= false;
	
	for ( var key in options ) {
		this[key] = options[key];
	};
	
	this.update = function( player ) {
			
		if ( player.currentTime > this.startTime && player.currentTime < this.endTime ) {
			if ( !this._hitFirst ) {
				this._hitFirst = true;
				if ( this.hitFirst ) this.hitFirst( player, this );
			}
			
			if ( !this._hit ) {
				this._hit = true;
				if ( this.hit ) this.hit( player, this );
			}
		} else {
			if ( this._hit ) this._hit = false;
		}
		
	};
	
	this.checkScrub = function( player, onStop ) {
		
		if ( player.currentTime > this.startTime && player.currentTime < this.endTime ) {
			
			if ( onStop ) {
				if ( this.scrubbedOnStop ) this.scrubbedOnStop( player, this );
			} else if ( !this._scrubbedOn ) {
				this._scrubbedOn = true;
				if ( this.scrubbedOn ) this.scrubbedOn( player, this );
			}
			
		} else {
			if ( this._scrubbedOn ) {
				this._scrubbedOn = false;
				if ( this.scrubbedOff ) this.scrubbedOff( player, this );
			};
		}
		
	};
	
	
};

var CustomVideoJSMarker = function( time, options, playerRef ) {
	
	this.time 			= time;
	this.timePercent	= null;
	this.percentage 	= true;
	this.playerRef		= playerRef;
	
	// we're automatically assuming if ( time < 1 ) then it's percentage based
	// if not it's time based
	if ( time > 1 ) this.percentage = false;
	
	// if ( time < 1 ) and user wants it to be time based they should set timeIsPercent: false
	if ( options.timeIsPercent != undefined ) this.percentage = options.timeIsPercent;
	
	this._hitFirst 		= false;
	this._hit			= false;
	this._scrubbedOn	= false;
	
	for ( var key in options ) {
		this[key] = options[key];
	};
	
	this.init = function( percentageChange, duration ) {
		
		if ( !this.percentage ) this.timePercent = this.time / duration;
		else this.timePercent = this.time;
		
		this.startTimeHit = this.timePercent;
		
		this.update = function( player ) {
				
			if ( player.currentPercent > this.timePercent + .008 ) {
				
				if ( this._hit ) this._hit = false;
				
			} else if ( player.currentPercent > this.startTimeHit ) {
				
				if ( !this._hit ) {
					
					if ( !this._hitFirst ){
						this._hitFirst = true;
						if ( this.hitFirst ) this.hitFirst( player, this );
					}
					
					this._hit = true;
					if ( this.hit ) this.hit( player, this );
				}
				
			}
		};
		
		this.startTimeScrub = this.timePercent - .013;
		this.endTimeScrub 	= this.timePercent + .013;
		
		this.checkScrub = function( player, onStop ) {
			
			if ( player.currentPercent > this.startTimeScrub ) {
				if ( player.currentPercent < this.endTimeScrub ) {
					player.onMarker = true;
					
					if ( !player._onMarker ) {
						player._onMarker = true;
						if ( player.scrubberOptions.onMarker ) player.scrubberOptions.onMarker( player, this );
					}
					if ( onStop ) {
						//if ( this.scrubbedOnStop ) this.scrubbedOnStop( player, this );
						if ( this.scrubbedOnDrop ) this.scrubbedOnDrop( player, this );
					} else {
						if ( !this._scrubbedOn ) {
							this._scrubbedOn = true;
							if ( this.scrubbedOn ) this.scrubbedOn( player, this );
						}
					}
				} else {
					if ( this._scrubbedOn ) {
						this._scrubbedOn = false;
						if ( this.scrubbedOff ) this.scrubbedOff( player, this );
					}
				}
			} else {
				if ( this._scrubbedOn ) {
					this._scrubbedOn = false;
					if ( this.scrubbedOff ) this.scrubbedOff( player, this );
				}
			}
		};
		
	};
	
	this.initOLD = function( percentageChange, duration ) {
		//console.log( 'percentageChange: ' + percentageChange );
		//console.log( 'duration: ' + duration );
		
		if ( !this.percentage ) this.timePercent = this.time / duration;
		else this.timePercent = this.time;
		
		//if ( this.playerRef.MOBILE && percentageChange < .005 ) percentageChange = .005;
		if ( percentageChange < .007 ) percentageChange = .007;
		//percentageChange = .01;
		//if ( this.playerRef)
		//if ( !playerRef.MOBILE && percentageChange > .01 ) percentageChange = .005;
		
		if ( this.percentage ) {
			
			this.startTimeHit = this.time - percentageChange;
			
			this.update = function( player ) {
				
				if ( player.currentPercent > this.time ) {
					
					if ( this._hit ) this._hit = false;
					
				} else if ( player.currentPercent > this.startTimeHit ) {
					
					if ( !this._hit ) {
						
						if ( !this._hitFirst ){
							this._hitFirst = true;
							if ( this.hitFirst ) this.hitFirst( player, this );
						}
						
						this._hit = true;
						if ( this.hit ) this.hit( player, this );
					}
					
				}
			};
			
			this.startTimeScrub = this.time - ( percentageChange * 1.5 );
			this.endTimeScrub 	= this.time + percentageChange;
			
			this.checkScrub = function( player, onStop ) {
				
				if ( player.currentPercent > this.startTimeScrub ) {
					if ( player.currentPercent < this.endTimeScrub ) {
						player.onMarker = true;
						
						if ( !player._onMarker ) {
							player._onMarker = true;
							if ( player.scrubberOptions.onMarker ) player.scrubberOptions.onMarker( player, this );
						}
						if ( onStop ) {
							if ( this.scrubbedOnStop ) this.scrubbedOnStop( player, this );
						} else {
							if ( !this._scrubbedOn ) {
								this._scrubbedOn = true;
								if ( this.scrubbedOn ) this.scrubbedOn( player, this );
							}
						}
					} else {
						if ( this._scrubbedOn ) {
							this._scrubbedOn = false;
							if ( this.scrubbedOff ) this.scrubbedOff( player, this );
						}
					}
				} else {
					if ( this._scrubbedOn ) {
						this._scrubbedOn = false;
						if ( this.scrubbedOff ) this.scrubbedOff( player, this );
					}
				}
			};
		} else {
			
			this.startTimeHit = this.time - ( percentageChange * duration );
			//console.log( 'startTimeHit: ' + this.startTimeHit );
			
			this.update = function( player ) {
				
				if ( player.currentTime > this.time ) {
					
					if ( this._hit ) this._hit = false;
					
					
				} else if ( player.currentTime > this.startTimeHit ) {
					
					if ( !this._hit ) {
						
						if ( !this._hitFirst ) {
							this._hitFirst = true;
							if ( this.hitFirst ) this.hitFirst( player, this );
						}
						
						this._hit = true;
						if ( this.hit ) this.hit( player, this );
					}
					
				}
			};
			
			this.startTimeScrub = this.time - ( percentageChange * 1.5 * duration );
			this.endTimeScrub 	= this.time + ( percentageChange * duration );
			
			this.checkScrub = function( player, onStop ) {
				
				if ( player.currentTime > this.startTimeScrub ) {
					if ( player.currentTime < this.endTimeScrub ) {
						player.onMarker = true;
						
						if ( !player._onMarker ) {
							player._onMarker = true;
							if ( player.scrubberOptions.onMarker ) {
								player.scrubberOptions.onMarker( player, this );
							}
						}
						if ( onStop ) {
							if ( this.scrubbedOnStop ) this.scrubbedOnStop( player, this );
						} else {
							if ( !this._scrubbedOn ) {
								this._scrubbedOn = true;
								if ( this.scrubbedOn ) this.scrubbedOn( player, this );
							}
							
						}
					} else {
						if ( this._scrubbedOn ) {
							this._scrubbedOn = false;
							if ( this.scrubbedOff ) this.scrubbedOff( player, this );
						}
					}
				} else {
					if ( this._scrubbedOn ) {
						this._scrubbedOn = false;
						if ( this.scrubbedOff ) this.scrubbedOff( player, this );
					}
				}
			};
			
		}
		
	};
	
	
};