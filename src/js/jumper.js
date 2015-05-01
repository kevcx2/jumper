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

    this.HEIGHT_SENSITIVITY = 1.2;
    this.POINT_DENSITY = 100;
    this.lastCurve = undefined; // to hold graphics object of last drawn curve - will be reset every frame
    this.lastCurveMirror = undefined;

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
        }, 1000);
        tween.interpolation(Phaser.Math.bezierInterpolation);
        tween.start();
        this.jumping = true;
        this.jumpready = false;
        // this.body.velocity.x = 200;
        this.jumpDistance = 0;
        this.jumpHeight = 0;
        this.jumpHeightStart = 0;
        this.jumpready = false;
        this.game.input.onUp.remove(this.jump, this);
      }
    },
    plot: {
      value: function (points) {
        this.path = [];
        this.points = points;

        var x = 1 / this.POINT_DENSITY;

        for (var i = 0; i <= 1; i += x)
        {
          var px = Phaser.Math.bezierInterpolation(points.x, i);
          var py = Phaser.Math.bezierInterpolation(points.y, i);

          this.path.push( { x: px, y: py });
        }
      }
    }
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
    // circle = game.add.sprite(game.width / 2 + 50, 300, 'circle');
    circle.anchor.set(0.5);
    circle.enableBody = true;
    game.physics.arcade.enable(circle);
    circle.body.bounce.x = 0.2;
    circle.body.gravity.x = -300;
    circle.body.collideWorldBounds = true;

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
    // else{
    //   ninjaFallingDown = true;
    //   poleGroup.forEach(function(item) {
    //     item.body.velocity.x = 0;
    //   });
    // }
  }


  function update () {

    game.physics.arcade.collide(circle, platforms, checkLanding);
    if (circle.jumpready === true) {
      circle.jumpDistance += 2;
      circle.jumpHeight = Math.abs(circle.jumpHeightStart - game.input.x) * circle.HEIGHT_SENSITIVITY;
    }
    var jumpPoints = {
      'x': [ circle.x, circle.x + circle.jumpHeight, circle.x],
      'y': [ circle.y, circle.y - circle.jumpDistance/2, circle.y - circle.jumpDistance]
    };
    // var mirrorJumpPoints = {
    //   'x': [ circle.x, circle.x + circle.jumpHeight, circle.x],
    //   'y': [ circle.y, circle.y + circle.jumpDistance/2, circle.y + circle.jumpDistance]
    // };
    // circle.plot(mirrorJumpPoints);
    circle.plot(jumpPoints);

    if (circle.jumpready === true) {
      if (circle.lastCurve) {
        circle.lastCurve.destroy();
        circle.lastCurveMirror.destroy();
      }
      //potential source of slowdown - revisit if performance is an issue
      // building / destroying graphics objects is somewhat cpu intensive
      var jumpPath = game.add.graphics(circle.x, circle.y);
      jumpPath.lineStyle(2, 0x99FFCC, 1);
      jumpPath.quadraticCurveTo(circle.jumpHeight, -circle.jumpDistance/2, 0, -circle.jumpDistance);
      circle.lastCurve = jumpPath;

      var jumpPathMirror = game.add.graphics(circle.x, circle.y);
      jumpPathMirror.lineStyle(2, 0x99FFCC, 1);
      jumpPathMirror.quadraticCurveTo(-circle.jumpHeight, -circle.jumpDistance/2, 0, -circle.jumpDistance);
      circle.lastCurveMirror = jumpPathMirror;
    }
  }

};
