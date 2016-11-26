Stopwatch = function ()  {
};

Stopwatch.prototype = {
   startTime: 0,
   running: false,
   elapsedTime: 0,

   start: function () {
      this.startTime = +new Date();
      this.elapsedTime = 0;
      this.running = true;
   },

   stop: function () {
      this.elapsedTime = +new Date() - this.startTime;
      this.running = false;
   },

   getElapsedTime: function () {
      if (this.running) return +new Date() - this.startTime;
      else              return this.elapsedTime;
   },

   reset: function() {
      this.elapsedTime = 0;
      this.startTime = 0;
      this.running = false;
   }
};
