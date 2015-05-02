window.onload = function() {

  var game = new Phaser.Game(600, 400, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
  });

  var Player = function (game, playerSprite) {

    this.game = game;
    this.jumping = false;
    this.jumpready = false;

    this.jumpDistance = 0;
    this.jumpHeight = 0;
    this.jumpHeightStart = 0;
    this.jumpReady = false;

    this.jumpGuideStartSpeed = 2.8;
    this.jumpGuideSpeed = this.jumpGuideStartSpeed;
    this.jumpGuideAccel = 1.03;

    this.HEIGHT_SENSITIVITY = 2;
    this.POINT_DENSITY = 100;
    this.lastCurve = undefined; // to hold graphics object of last drawn curve - will be reset every frame
    this.pointGraphics = [];
    // this.lastCurveMirror = undefined;

    Phaser.Sprite.call(this, game, game.width / 2 + 50, 300, playerSprite);
  };

  Player.prototype = Object.create(Phaser.Sprite.prototype, {

    prepareToJump: {
      value: function (clickEvent) {
        this.jumpready = true;
        this.jumpHeightStart = clickEvent.clientX;
        this.game.input.onDown.remove(this.prepareToJump, this);
        this.game.input.onUp.add(this.jump, this);
      }
    },

    jump: {
      value: function () {
        console.log(this.points);
        var tween = this.game.add.tween(this);
        tween.to({
          x: this.points.x,
          y: this.points.y
        }, 800);
        tween.interpolation(Phaser.Math.bezierInterpolation);
        tween.start();
        this.jumping = true;
        this.jumpready = false;
        // this.body.velocity.x = 200;
        this.jumpDistance = 0;
        this.jumpHeight = 0;
        this.jumpHeightStart = 0;
        this.jumpGuideSpeed = this.jumpGuideStartingSpeed;
        this.jumpready = false;
        this.game.input.onUp.remove(this.jump, this);
      }
    },
  });

  Player.prototype.constructor = Player;

  var platforms;
  var circle;

  function preload () {
    game.load.image('circle', 'sprites/circle.png');
    game.load.image('square', 'sprites/square.png');
    game.load.image('triangle', 'sprites/triangle.png');
  }

  function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    circle = new Player(game, 'circle');
    circle.anchor.set(0.5);
    circle.enableBody = true;
    game.physics.arcade.enable(circle);
    circle.body.bounce.x = 0.2;
    // circle.body.collideWorldBounds = true;

    game.add.existing(circle);

    platforms = game.add.group();
    platforms.enableBody = true;

    var ledge = platforms.create(game.width / 2, game.height / 2, 'square');

    ledge.body.immovable = true;
    ledge.anchor.set(0.5, 0.5);

    ledge = platforms.create(game.width / 2, 300, 'square');

    ledge.body.immovable = true;
    ledge.anchor.set(0.5, 0.5);

    // Set up handlers for mouse events
    game.input.onDown.add(circle.prepareToJump, circle);
    // game.input.addMoveCallback(mouseDragMove, this);
  }

  function checkLanding (circle, platform){
    if(platform.x <= circle.x + circle.width / 2 ){
      var border = circle.y - platform.y;
      if(Math.abs(border) > 20){
        circle.body.velocity.y = border * 2;
        circle.body.velocity.x = -200;
      }

      if(circle.jumping){
        circle.jumping = false;
        game.input.onDown.add(circle.prepareToJump, circle);
      }
    }
  }


  function update () {

    game.physics.arcade.collide(circle, platforms, checkLanding);
    if (circle.jumpready === true) {
      circle.jumpGuideSpeed *= circle.jumpGuideAccel;
      circle.jumpDistance += circle.jumpGuideSpeed;
      circle.jumpHeight = Math.abs(circle.jumpHeightStart - game.input.x) * circle.HEIGHT_SENSITIVITY;
    }

    // trace jump path
    // rect = game.add.graphics(circle.x, circle.y);
    // rect.lineStyle(1, 0x0000FF, 1);
    // rect.drawRect(1,1,1,1);

    circle.points = {
      'x': [ circle.x, circle.x + circle.jumpHeight + (circle.jumpHeight * 0.01), circle.x],
      'y': [ circle.y, (circle.y - circle.jumpDistance/2), circle.y - circle.jumpDistance]
    };

    if (circle.jumpready === true) {
      if (circle.lastCurve) {
        circle.lastCurve.destroy();
        circle.lastCurveMirror.destroy();
      }
      circle.pointGraphics.forEach(function (graphic) {
        graphic.destroy();
      });
      circle.pointGraphics = [];
      var jumpPath = game.add.graphics(circle.x + 2, circle.y + 2);
      jumpPath.lineStyle(5, 0x99FFCC, 0.5);
      jumpPath.quadraticCurveTo(
        circle.jumpHeight - (circle.jumpHeight * 0.09), -circle.jumpDistance/2 - 5, 0 - 2, -circle.jumpDistance - 2
      );
      circle.lastCurve = jumpPath;

      var jumpPathMirror = game.add.graphics(circle.x + 2, circle.y + 2);
      jumpPathMirror.lineStyle(5, 0x99FFCC, 0.5);
      jumpPathMirror.quadraticCurveTo(
        -(circle.jumpHeight - (circle.jumpHeight * 0.09)), -circle.jumpDistance/2 - 5, 0 - 2, -circle.jumpDistance - 2
      );
      circle.lastCurveMirror = jumpPathMirror;
    }
  }

};
