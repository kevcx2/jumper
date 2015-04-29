window.onload = function() {

  var game = new Phaser.Game(600, 400, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
  });

  var Player = function (game, playerSprite) {

    Phaser.Sprite.call(this, game, game.width / 2 + 50, 300, playerSprite);

    this.game = game;
    this.jumping = false;
  };

  Player.prototype = Object.create(Phaser.Sprite.prototype, {

    prepareToJump: {
      value: function () {
        this.game.input.onDown.remove(this.prepareToJump, this);
        this.game.input.onUp.add(this.jump, this);
      }
    },

    jump: {
      value: function () {
        this.jumping = true;
        this.body.velocity.x = 200;
        this.game.input.onUp.remove(this.jump, this);
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
  }

};