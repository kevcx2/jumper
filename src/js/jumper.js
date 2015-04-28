window.onload = function() {

  var game = new Phaser.Game(600, 400, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
  });
  var platforms;
  var circle;

  function preload () {
    game.load.image('circle', 'sprites/circle.png');
    game.load.image('square', 'sprites/square.png');
    game.load.image('triangle', 'sprites/triangle.png');
  }

  function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    circle = game.add.sprite(game.width / 2 + 50, 300, 'circle');
    circle.anchor.set(0.5);
    circle.enableBody = true;
    game.physics.arcade.enable(circle);
    circle.body.bounce.x = 0.2;
    circle.body.gravity.x = -300;
    circle.body.collideWorldBounds = true;

    platforms = game.add.group();
    platforms.enableBody = true;

    var ledge = platforms.create(game.width / 2, game.height / 2, 'square');

    ledge.body.immovable = true;
    ledge.anchor.set(0.5, 0.5);

    ledge = platforms.create(game.width / 2, 300, 'square');

    ledge.body.immovable = true;
    ledge.anchor.set(0.5, 0.5);

    // Set up handlers for mouse events
    game.input.onDown.add(prepareToJump, this);
    // game.input.addMoveCallback(mouseDragMove, this);

  }

  function prepareToJump () {
    game.input.onDown.remove(prepareToJump, this);
    game.input.onUp.add(jump, this);  
  }

  function jump () {
    circle.body.velocity.x = 200;
    game.input.onUp.remove(jump, this);
  }


  function update () {
    game.physics.arcade.collide(circle, platforms);
  }

};