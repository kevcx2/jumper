window.onload = function() {

  var game = new Phaser.Game(400, 500, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  var platforms;
  var circle;
  var score;
  var addPlats = false;
  var topPlat = 0;
  var platDist = -60;
  var platDistRange = -200;
  var playerOnCameraY = 5/6;
  var debug = false;

  function preload () {
    game.load.image('circle', 'sprites/circle.png');
    game.load.image('square', 'sprites/square.png');
    game.load.image('triangle', 'sprites/triangle.png');
    game.camera.bounds = null;
  }

  function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    circle = new Player(game, 'circle');
    game.physics.arcade.enable(circle);

    game.add.existing(circle);
    platforms = game.add.group();

    //create starting platform
    addPlatforms(1, circle.x - 3, circle.y - 3);

    //create 20 platforms
    addPlatforms(20, game.width / 2);

    score = game.add.text(0, 0, "Score: " + circle.score,
      { font: "18px Arial", fill: "#fff", align: "left" }
    );
  }

  function checkLanding (circle, platforms){
    if (!circle.jumping) {
      var jumpStatus = false;
      for(var i = 0; i < platforms.length; i++) {
        if (Phaser.Rectangle.intersects(circle.body, platforms.children[i].body)) {
          jumpStatus = true;
        }
      }
      return jumpStatus;
    }
    return true;
  }

  function addPlatforms(num, x, y) {
    //create 10 platforms
    for(var i = 0; i < num; i++) {
      topPlat = topPlat + platDist + (Math.random() * platDistRange);
      var ledge = platforms.create(x, y || topPlat, 'square');
      ledge.anchor.set(0.5, 0.5);
      game.physics.arcade.enable(ledge);
    }
  }

  function deletePlatforms () {
    platforms.forEach( function (platform) {
      if (platform.y > game.camera.y + game.height) {
        platforms.remove(platform, true);
      }
    }, this);
  }


  function update () {
    game.camera.y = circle.y - (game.height * playerOnCameraY) + (circle.height / 2);
    if (!circle.jumping) {
      console.log(checkLanding(circle, platforms));
    }

    //update score
    score.text = "Score: " + circle.score;
    score.x = game.camera.x;
    score.y = game.camera.y;

    //add new platforms
    //note: old platforms are not currently being destroyed
    if ((circle.score % 10 === 0) && (addPlats === true)) {
      console.log('add plats');
      addPlatforms(10, game.width / 2);
      addPlats = false;
    }
    else if (circle.score % 10 === 1) {
      addPlats = true;
    }
    deletePlatforms();
  }

  function render () {
    //debug render info
    if (debug) {
      game.debug.cameraInfo(game.camera, 32, 32);
      game.debug.spriteCoords(circle, 32, game.height - 100);
    }
  }

};
