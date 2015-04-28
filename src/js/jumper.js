window.onload = function() {

  var game = new Phaser.Game(600, 400, Phaser.AUTO, '', { preload: preload, create: create });
  var platforms;

  function preload () {
    
  }

  function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    platforms = game.add.group();
    platforms.enableBody = true;
  }

};
