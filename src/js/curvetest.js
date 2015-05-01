window.onload = function() {

var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');

var CurveTest = function () {

  this.startX = 100;
  this.startY = 200;

  this.jumpDistance = 0;
  this.jumpHeight = 0;
  this.jumpHeightStart = 0;
  this.jumpReady = false;

  this.HEIGHT_SENSITIVITY = 2;
  this.POINT_DENSITY = 100;

  this.lastCurve = undefined;
};

CurveTest.prototype = {

  init: function () {
    game.renderer.renderSession.roundPixels = true;
    this.stage.backgroundColor = '#204090';
    game.time.advancedTiming = true;
  },

  preload: function () {
  },

  create: function () {
    //debug fps
    this.fpsText = game.add.text(0, 0, '');

    game.input.onDown.add(this.adjustCurve, this);
    game.input.onUp.add(this.jump, this);
  },

  adjustCurve: function (clickEvent) {
    this.jumpDistance = 0;
    this.jumpHeight = 0;
    this.jumpHeightStart = 0;
    this.jumpready = true;
    this.jumpHeightStart = clickEvent.clientY;
  },

  jump: function () {
    this.jumpready = false;
  },

  update: function () {

    if (this.jumpready === true) {
      this.jumpDistance += 2;
      this.jumpHeight = Math.abs(this.jumpHeightStart - game.input.y) * this.HEIGHT_SENSITIVITY;
    }

    if (this.lastCurve) {
      this.lastCurve.destroy();
      this.lastCurveMirror.destroy();
    }
    //potential source of slowdown - revisit if performance is an issue
    // building / destroying graphics objects is somewhat cpu intensive
    var jumpPath = game.add.graphics(this.startX, this.startY);
    jumpPath.lineStyle(2, 0x99FFCC, 1);
    jumpPath.quadraticCurveTo(this.jumpDistance/2, -this.jumpHeight, this.jumpDistance, 0);
    this.lastCurve = jumpPath;

    var jumpPathMirror = game.add.graphics(this.startX, this.startY);
    jumpPathMirror.lineStyle(2, 0x99FFCC, 1);
    jumpPathMirror.quadraticCurveTo(this.jumpDistance/2, +this.jumpHeight, this.jumpDistance, 0);
    this.lastCurveMirror = jumpPathMirror;

    this.fpsText.text = game.time.fps;
  }
};

game.state.add('Game', CurveTest, true);


};
