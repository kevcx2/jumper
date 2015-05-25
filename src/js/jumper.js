window.onload = function() {

  var game = new Phaser.Game(400, 500, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  var targets;
  var platforms;
  var circle;
  var score;
  var addPlats = false;
  var topPlat = 0;
  var topTarg = 0;
  var targDist = -80;
  var targDistRange = -60;
  var platDist = -40;
  var platDistRange = -100;
  var playerOnCameraY = 5/6;
  var debug = true;

  function preload () {
    game.load.image('circle', 'src/sprites/circle.png');
    game.load.image('square', 'src/sprites/square.png');
    game.load.image('triangle', 'src/sprites/triangle.png');
    game.load.image('particle', 'src/sprites/particle.png');
    game.load.image('burst', 'src/sprites/burst.png');
    game.camera.bounds = null;
  }

  function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    circle = new Player(game, 'circle');
    game.physics.arcade.enable(circle);

    game.add.existing(circle);
    platforms = game.add.group();
    targets = game.add.group();

    //create starting platform
    addPlatforms(1, circle.x, circle.y);

    //create 20 platforms
    addPlatforms(20, game.width / 2);

    score = game.add.text(0, 0, "Score: " + circle.score,
      { font: "18px Arial", fill: "#fff", align: "left" }
    );
  }

  function checkLanding (circle, platforms){
    circle.landed = false;
    var jumpStatus = false;
    platforms.forEach( function (platform) {
      if (Phaser.Rectangle.intersects(circle.body, platform.body)) {
        jumpStatus = true;
        shrinkPlatform(platform);
      }
      else if (circle.y < platform.y) {
        platform.alive = false;
      }
    });
    //check to make sure circle has jumped OK AND it collected a target on the jump
    jumpStatus = jumpStatus && circle.target;
    circle.target = false;

    return jumpStatus;
  }

  function checkTarget(circle, targets) {
    targets.forEach( function (target) {
      if (Phaser.Rectangle.intersects(circle.body, target.body)) {
        console.log('here');
        circle.target = true;
        circle.burst();
        target.mirror.destroy();
        target.destroy();
      }
    });
  }

  function addPlatforms(num, x, y) {
    for(var i = 0; i < num; i++) {
      platRangeStartY = topTarg + platDist;
      platRangeLengthY = (Math.random() * platDistRange);
      topPlat = platRangeStartY + platRangeLengthY;

      var platform = platforms.create(x, y || topPlat, 'square');
      addTarget(platform);

      platform.anchor.set(0.5, 0.5);
      game.physics.arcade.enable(platform);
    }
  }

  function addTarget(platform) {
    randX = game.width/2 + 10 + (Math.random() * (game.width/2 - 50));
    randY = platform.y + targDist + (Math.random() * targDistRange);
    topTarg = randY;

    var target = targets.create(randX, randY, 'triangle');
    game.physics.arcade.enable(target);

    target.mirror = targets.create(game.width - target.x - target.height, target.y, 'triangle');
    game.physics.arcade.enable(target.mirror);
  }

  function deleteTargets() {
    targets.forEach( function (target) {
      if (target.y > game.camera.y + game.height) {
        targets.remove(target, true);
      }
    }, this);
  }

  function deletePlats () {
    platforms.forEach( function (platform) {
      if (platform.y > game.camera.y + game.height) {
        platforms.remove(platform, true);
      }
    }, this);
  }

  function updateScore() {
    score.text = "Score: " + circle.score;
    score.x = game.camera.x;
    score.y = game.camera.y;
  }

  function updatePlats() {
    if ((circle.score % 10 === 0) && (addPlats === true)) {
      console.log('add plats');
      addPlatforms(10, game.width / 2);
      addPlats = false;
    }
    else if (circle.score % 10 === 1) {
      addPlats = true;
    }
  }

  function resetGame() {
    console.log('reset');

    platforms.removeAll(true);
    targets.removeAll(true);
    circle.resetState();

    //create starting platform
    addPlatforms(1, circle.x, circle.y);
    //create 20 platforms
    addPlatforms(20, game.width / 2);
  }

  function shrinkPlatform (platform) {
    var shrink = game.add.tween(platform);
    shrink.to({ alpha: 0 }, 2000);
    shrink.start();
    platform.alive = false;

    shrink.onComplete.add(function (plat) {
      if (circle.y > plat.y - plat.height) {
        resetGame();
      }
      plat.destroy();
    }, this);
  }

  function update () {
    game.camera.y = circle.y - (game.height * playerOnCameraY) + (circle.height / 2);

    if (circle.landed) {
      if (!checkLanding(circle, platforms)) {
        resetGame();
      }
    }

    if (circle.jumping) {
      checkTarget(circle, targets);
    }

    updateScore();
    updatePlats();
    deletePlats();
    deleteTargets();
    // console.log('num platforms: ' + platforms.children.length);
    // console.log('num targets: ' + targets.children.length);
  }

  function render () {
    //debug render info
    if (debug) {
      game.debug.cameraInfo(game.camera, 32, 32);
      game.debug.spriteCoords(circle, 32, game.height - 100);
    }
  }

};
