window.onload = function() {

  var game = new Phaser.Game(600, 400, Phaser.AUTO, '', { preload: preload, create: create });
  var platforms;

  function preload () {
    game.load.image('circle', 'sprites/circle.png');
    game.load.image('square', 'sprites/square.png');
    game.load.image('triangle', 'sprites/triangle.png');
  }

  function create () {
    game.add.sprite(0, 0, 'circle');
    game.physics.startSystem(Phaser.Physics.ARCADE);

    platforms = game.add.group();
    platforms.enableBody = true;

    var ledge = platforms.create(50, 50, 'square');

    ledge.body.immovable = true;

    ledge = platforms.create(150, 150, 'square');

    ledge.body.immovable = true;
  }

};