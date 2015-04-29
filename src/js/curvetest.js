window.onload = function() {

var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');

var CurveTest = function () {

  this.bmd = null;
  this.startX = 100;
  this.startY = 200;

  this.jumpDistance = 0;
  this.jumpHeight = 0;
  this.jumpHeightStart = 0;
  this.jumpReady = false;

  this.HEIGHT_SENSITIVITY = 1.2;
  this.POINT_DENSITY = 100;
};

CurveTest.prototype = {

  init: function () {
    game.renderer.renderSession.roundPixels = true;
    this.stage.backgroundColor = '#204090';
  },

  preload: function () {
  },

  create: function () {
    this.bmd = this.add.bitmapData(game.width, game.height);
    this.bmd.addToWorld();
    game.input.onDown.add(this.adjustCurve, this);
    game.input.onUp.add(this.jump, this);
  },

  adjustCurve: function (clickEvent) {
    this.jumpready = true;
    this.jumpHeightStart = clickEvent.clientY;
    console.log(this.jumpHeight);
  },

  jump: function () {
    this.jumpDistance = 0;
    this.jumpHeight = 0;
    this.jumpHeightStart = 0;
    this.jumpready = false;
  },

  plot: function (points) {
    this.path = [];

    var x = 1 / this.POINT_DENSITY;

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
    this.bmd.clear();

    if (this.jumpready === true) {
      this.jumpDistance += 2;
      this.jumpHeight = Math.abs(this.jumpHeightStart - game.input.y) * this.HEIGHT_SENSITIVITY;
    }
    var jumpPoints = {
      'x': [ this.startX, this.startX + this.jumpDistance/2, this.startX + this.jumpDistance],
      'y': [ this.startY, this.startY - this.jumpHeight, this.startY]
    };
    var mirrorJumpPoints = {
      'x': [ this.startX, this.startX + this.jumpDistance/2, this.startX + this.jumpDistance],
      'y': [ this.startY, this.startY + this.jumpHeight, this.startY]
    };
    this.plot(mirrorJumpPoints);
    this.plot(jumpPoints);
  }
};

game.state.add('Game', CurveTest, true);


};
