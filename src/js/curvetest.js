window.onload = function() {

var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');

var CurveTest = function () {

  this.bmd = null;
  this.points = {
      'x': [ 100, 200, 300],
      'y': [ 200, 100, 200]
  };

  this.jumpDistance = 0;
  this.jumpReady = false;
};

CurveTest.prototype = {

  init: function () {
    game.renderer.renderSession.roundPixels = true;
    this.stage.backgroundColor = '#204090';
  },

  preload: function () {
  },

  create: function () {
    this.bmd = this.add.bitmapData(this.game.width, this.game.height);
    this.bmd.addToWorld();
    game.input.onDown.add(this.adjustCurve, this);
    game.input.onUp.add(this.jump, this);
    console.log('created');
  },

  adjustCurve: function () {
    this.jumpready = true;
  },

  jump: function () {
    this.jumpDistance = 0;
    this.jumpready = false;
  },

  plot: function (points) {

    this.bmd.clear();

    this.path = [];

    var x = 1 / 100;

    for (var i = 0; i <= 1; i += x)
    {
      var px = this.math.bezierInterpolation(points.x, i);
      var py = this.math.bezierInterpolation(points.y, i);

      this.path.push( { x: px, y: py });

      this.bmd.rect(px, py, 1, 1, 'rgba(255, 255, 255, 1)');
    }

    for (var p = 0; p < points.x.length; p++)
    {
        this.bmd.rect(points.x[p]-3, points.y[p]-3, 6, 6, 'rgba(255, 0, 0, 1)');
    }

  },

  update: function () {
    if (this.jumpready === true) {
      this.jumpDistance += 2;
      console.log(this.jumpDistance);
    }
    console.log('jumpdist: ' + this.jumpDistance);
    var jumpPoints = {
        'x': [ 100, ((100 +  300 + this.jumpDistance)/2), 300 + this.jumpDistance],
        'y': [ 200, 100, 200]
    };
    this.plot(jumpPoints);
  }

};

game.state.add('Game', CurveTest, true);


};
