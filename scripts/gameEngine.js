var getTimeNow = function () {
   return +new Date();
};
var Game = function (gameName, canvasId) {
   var canvas = document.getElementById(canvasId),
   canvasbg = document.getElementById(canvasId+'bg'),
       self = this; // Used by key event handlers below

   this.context = canvas.getContext('2d');
   this.contextbg = canvasbg.getContext('2d');
   this.gameName = gameName;
   this.sprites = [];
   this.keyListeners = [];

   this.HIGH_SCORES_SUFFIX = '_highscores';

   this.imageLoadingProgressCallback;
   this.images = {};
   this.imageUrls = [];
   this.imagesLoaded = 0;
   this.imagesFailedToLoad = 0;
   this.imagesIndex = 0;

   // Time
   
   this.startTime = 0;
   this.lastTime = 0;
   this.gameTime = 0;
   this.fps = 0;
   this.STARTING_FPS = 60;

	this.stop = false;
	this.timerId = 0;
   this.paused = false;
   this.startedPauseAt = 0;
   this.PAUSE_TIMEOUT = 100;

   // Sound

   this.soundOn = true;
   this.soundChannels = [];
   this.audio = new Audio();
   this.NUM_SOUND_CHANNELS = 10;

   for (var i=0; i < this.NUM_SOUND_CHANNELS; ++i) {
      var audio = new Audio();
      this.soundChannels.push(audio);
   }

   //window.onkeypress = function (e) { self.keyPressed(e)  };
   window.onkeydown  = function (e) { self.keyPressed(e); };

   return this;
};

// Game methods...............................................................

Game.prototype = {
   getImage: function (imageUrl) {
      return this.images[imageUrl];
   },
   imageLoadedCallback: function (e) {
      this.imagesLoaded++;
   },
   imageLoadErrorCallback: function (e) {
      this.imagesFailedToLoad++;
   },
   loadImage: function (imageUrl) {
      var image = new Image(),
          self = this; // load and error event handlers called by DOMWindow

      image.src = imageUrl;

      image.addEventListener('load',
         function (e) {
            self.imageLoadedCallback(e); 
         });

      image.addEventListener('error',
         function (e) {
            self.imageLoadErrorCallback(e);
         });

      this.images[imageUrl] = image;
   },
   loadImages: function () {
      if (this.imagesIndex < this.imageUrls.length) {
         this.loadImage(this.imageUrls[this.imagesIndex]);
         this.imagesIndex++;
      }
      return (this.imagesLoaded + this.imagesFailedToLoad) /
              this.imageUrls.length * 100;
   },
   queueImage: function (imageUrl) {
      this.imageUrls.push(imageUrl);
   },
   tick: function (time) {
      this.updateFrameRate(time);
      this.gameTime = (getTimeNow()) - this.startTime;
   },
   updateFrameRate: function (time) {
      if (this.lastTime === 0) this.fps = this.STARTING_FPS;
      else if (this.lastTime === time) this.fps = 1000;
      else                     this.fps = 1000 / Math.abs(time - this.lastTime);
   },
   pixelsPerFrame: function (time, velocity) {
	   if(this.fps==Infinity) {
		this.updateFrameRate(time);
	   }
	   
	   return velocity/parseInt(this.fps);
      //return velocity / (isNaN(this.fps)?100:this.fps);  // pixels / frame
   },
   paintBg: function(){},
   start: function () {
      var self = this;               // The this variable is the game
      this.startTime = getTimeNow(); // Record game's startTime (used for pausing)
		this.stop = false;

      this.timerId = window.requestNextAnimationFrame(
         function (time) {
            // The this variable in this function is the window, not the game,
            // which is why we do not simply do this: animate.call(time).
            self.animate.call(self, time); // self is the game	
         });
   },
   stopAnimate: function() {
	   this.stop = true;	
		this.clearScreen(); 
	  this.paintUnderSprites();	   
	   this.gameTime = this.startTime = this.lastTime = this.time = 0;
	   window.cancelNextRequestAnimationFrame(this.timerId);	   
   },
   animate: function (time) {
      var self = this; // window.requestNextAnimationFrame() called by DOMWindow
	  if(this.stop) {
		  return;
	  }
      //console.log(time+","+this.lastTime+","+this.fps);
      if (this.paused) {
         // In PAUSE_TIMEOUT (100) ms, call this method again to see if the game
         // is still paused. There's no need to check more frequently.         
         setTimeout( function () {
            window.requestNextAnimationFrame(
               function (time) {
                  self.animate.call(self, time);
               });
         }, this.PAUSE_TIMEOUT);
      } else {                       // Game is not paused
         this.tick(time);          // Update fps, game time
         this.clearScreen();       // Clear the screen in preparation for next frame
		 
         this.startAnimate(time);  // Override as you wish
         this.paintUnderSprites(); // Override as you wish

         this.updateSprites(time); // Invoke sprite behaviors
         this.paintSprites(time);  // Paint sprites in the canvas

         this.paintOverSprites();  // Override as you wish
         this.endAnimate();        // Override as you wish

         this.lastTime = time;

         // Call this method again when it's time for the next animation frame
	 
        var timerId = window.requestNextAnimationFrame(
            function (time) {
               self.animate.call(self, time); // The this variable refers to the window
			   window.cancelNextRequestAnimationFrame(timerId);
            });
      }
   },

   clearScreen: function () {
      this.context.clearRect(0, 0,
         this.context.canvas.width, this.context.canvas.height);
   },
   updateSprites: function (time) {
      for(var i=0; i < this.sprites.length; ++i) {
         var sprite = this.sprites[i];
         sprite.update(this.context, time);
      };
   },
   paintSprites: function (time) {
      for(var i=0; i < this.sprites.length; ++i) {
         var sprite = this.sprites[i];
         if (sprite.visible)
            sprite.paint(this.context);
      };
   },
   togglePaused: function () {
      var now = getTimeNow();
      this.paused = !this.paused;
      if (this.paused) {
         this.startedPauseAt = now;
      } else {
         this.startTime = this.startTime + now - this.startedPauseAt;
         this.lastTime = now;
      }
   },

   getHighScores: function () {
      var key = this.gameName + this.HIGH_SCORES_SUFFIX,
          highScoresString = localStorage[key];

      if (highScoresString == undefined) {
         localStorage[key] = JSON.stringify([]);
      }
      return JSON.parse(localStorage[key]);
   },
   setHighScore: function (highScore) {
      var key = this.gameName + this.HIGH_SCORES_SUFFIX,
          highScoresString = localStorage[key];
      highScores.unshift(highScore);
      localStorage[key] = JSON.stringify(highScores);
   },
   clearHighScores: function () {
      localStorage[this.gameName + this.HIGH_SCORES_SUFFIX] = JSON.stringify([]);
   },
   addKeyListener: function (keyAndListener) {
      this.keyListeners.push(keyAndListener);
   },
   findKeyListener: function (key) {
      var listener = undefined;
      
      for(var i=0; i < this.keyListeners.length; ++i) {
         var keyAndListener = this.keyListeners[i],
             currentKey = keyAndListener.key;
         if (currentKey === key) {
            listener = keyAndListener.listener;
         }
      };
      return listener;
   },
   keyPressed: function (e) {
      var listener = undefined,
          key = undefined;

      switch (e.keyCode) {
         // Add more keys as needed

         case 32: key = 'space';        break;
         case 68: key = 'd';            break;
         case 75: key = 'k';            break;
         case 83: key = 's';            break;
         case 80: key = 'p';            break;
         case 37: key = 'left arrow';   break;
         case 39: key = 'right arrow';  break;
         case 38: key = 'up arrow';     break;
         case 40: key = 'down arrow';   break;
      }

      listener = this.findKeyListener(key);
      if (listener) { // listener is a function
         listener();  // invoke the listener function
      }
   },
   canPlayOggVorbis: function () {
      return "" != this.audio.canPlayType('audio/ogg; codecs="vorbis"');
   },
   canPlayMp3: function () {
      return "" != this.audio.canPlayType('audio/mpeg');
   },
   getAvailableSoundChannel: function () {
      var audio;
      for (var i=0; i < this.NUM_SOUND_CHANNELS; ++i) {
         audio = this.soundChannels[i];
         if (audio.played.length === 0 || audio.ended) {
            return audio;
         }
      }
      return undefined; // all channels in use
   },
   playSound: function (id) {
      var channel = this.getAvailableSoundChannel(),
          element = document.getElementById(id);

      if (channel && element) {
         channel.src = element.src === '' ? element.currentSrc : element.src;
         channel.load();
         channel.play();
      }
   },
   addSprite: function (sprite) {
      this.sprites.push(sprite);
   },
   getSprite: function (name) {
      for(i in this.sprites) {
         if (this.sprites[i].name === name)
            return this.sprites[i];
      }
      return null;      
   },
   // Override the following methods as desired:
   startAnimate:      function (time) { }, // These methods are called by
   paintUnderSprites: function ()     { }, // animate() in the order they
   paintOverSprites:  function ()     { }, // are listed. Override them
   endAnimate:        function ()     { }  // as you wish.
};
