var Player = function (game, playerSprite) {

  //states
  this.game = game;
  this.jumping = false;
  this.jumpready = false;

  //score
  this.score = 0;

  //jump attrs
  this.jumpDistance = 0;
  this.jumpHeight = 0;
  this.jumpHeightStart = 0;

  //jump guide attrs
  this.jumpGuideStartSpeed = 2.8;
  this.jumpGuideSpeed = this.jumpGuideStartSpeed;
  this.jumpGuideAccel = 1.03;
  // to hold graphics object of last drawn curve - will be reset every frame
  this.lastCurve = undefined;

  //jump path
  this.HEIGHT_SENSITIVITY = 2;

  //create sprites
  Phaser.Sprite.call(this, game, game.width / 2, 0, playerSprite);
  this.mirror = this.game.add.sprite(game.width / 2, 0, playerSprite);
  this.anchor.set(0.5);
  this.mirror.anchor.set(0.5);

  //set intital event handler
  this.game.input.onDown.add(this.prepareToJump, this);

  //set up particle emitter on player object & mirror
  this.particleDensity = 100;
  this.emitter = this.createParticleEmitter();
  this.mirrorEmitter = this.createParticleEmitter();
};

Player.prototype = Object.create(Phaser.Sprite.prototype, {

  createParticleEmitter: {
    value: function () {
      emitter = this.game.add.emitter(0, 0, this.particleDensity);
      emitter.makeParticles('particle');

      emitter.setRotation(0, 0);
      emitter.lifespan = 500;
      // emitter.start(false, 5000, 100);

      return emitter;
    }
  },

  prepareToJump: {
    value: function (clickEvent) {
      // console.log('jumpprep');
      // this.debugPrint();

      this.jumpready = true;
      this.jumpHeightStart = clickEvent.clientX;

      this.game.input.onDown.remove(this.prepareToJump, this);
      this.game.input.onUp.add(this.jump, this);
    }
  },

  jump: {
    value: function () {
      // console.log('jump');

      //speed of jump scales on both distance and height of jump - longer jumps
      //are relatively slower, tiny jumps are relatively faster
      var jumpSpeed = 10 * ((0.25 * this.jumpDistance) + (0.1 * this.jumpHeight));

      //create tweens to animate the player & its mirror
      var tween = this.jumpAnimate(this, jumpSpeed);
      this.jumpAnimate(this.mirror, jumpSpeed);
      tween.onComplete.add(this.land, this);

      this.jumping = true;
      this.jumpready = false;

      this.jumpDistance = 0;
      this.jumpHeight = 0;
      this.jumpHeightStart = 0;
      this.jumpGuideSpeed = this.jumpGuideStartSpeed;
      this.jumpready = false;
      this.game.input.onUp.remove(this.jump, this);
      this.fadeTrail();
    }
  },

  land: {
    value: function () {
      // console.log('landed');

      this.jumping = false;
      this.score += 1;
      this.game.input.onDown.add(this.prepareToJump, this);
    }
  },

  fadeTrail: {
    value: function () {

      //set tweens to fade out the old trail
      oldCurve = this.lastCurve;
      oldCurveMirror = this.lastCurveMirror;
      this.lastCurve = undefined;
      this.lastCurveMirror = undefined;

      fade = this.game.add.tween(oldCurve);
      fade.to({ alpha: 0 }, 500);
      fade.onComplete.add(function () {
        oldCurve.destroy();
      });

      fadeMirror = this.game.add.tween(oldCurveMirror);
      fadeMirror.to({ alpha: 0 }, 500);
      fadeMirror.onComplete.add(function () {
        oldCurveMirror.destroy();
      });

      fade.start();
      fadeMirror.start();
    }
  },

  jumpAnimate: {
    value: function (sprite, speed) {
      var tween = this.game.add.tween(sprite);
      tween.to({
        x: sprite.points.x,
        y: sprite.points.y
      }, speed);
      tween.interpolation(Phaser.Math.bezierInterpolation);
      tween.start();

      return tween;
    }
  },

  drawGuide: {
    value: function (height, distance) {
      //contains magic numbers for adjusting drawn curve to match the path it follows - revisit

      var jumpPath = this.game.add.graphics(this.x + 2, this.y + 2);
      jumpPath.lineStyle(5, 0x99FFCC, 0.5);
      jumpPath.quadraticCurveTo(
        height - (height * 0.09), -distance/2 - 5, 0 - 2, -distance - 2
      );
      this.lastCurve = jumpPath;

      var jumpPathMirror = this.game.add.graphics(this.x + 2, this.y + 2);
      jumpPathMirror.lineStyle(5, 0x99FFCC, 0.5);
      jumpPathMirror.quadraticCurveTo(
       -(height - (height * 0.09)), -distance/2 - 5, 0 - 2, -distance - 2
      );
      this.lastCurveMirror = jumpPathMirror;
    }
  },

  updateEmitters: {
    value: function () {
      this.emitter.x = this.x;
      this.emitter.y = this.y;
      this.mirrorEmitter.x = this.mirror.x;
      this.mirrorEmitter.y = this.mirror.y;

      if (this.jumping === true) {
        this.emitter.emitParticle();
        this.mirrorEmitter.emitParticle();
      }
    }
  },

  debugPrint: {
    value: function () {
      console.log('jumping: ' + this.jumping);
      console.log('jumpready ' + this.jumpready);

      //jump attrs
      console.log('jumpDist ' + this.jumpDistance);
      console.log('jumpHeight ' + this.jumpHeight);
      console.log('jumpStart ' + this.jumpHeightStart);

      //jump guide attrs
      console.log('jumpGuideSpeed ' + this.jumpGuideSpeed);
    }
  },
});

Player.prototype.constructor = Player;

Player.prototype.update = function () {

  //update location of particle emitter to follow player & emit
  this.updateEmitters();

  //update jumpHeight based on an accelerating guide curve
  if (this.jumpready === true) {
    this.jumpGuideSpeed *= this.jumpGuideAccel;
    this.jumpDistance += this.jumpGuideSpeed;
    this.jumpHeight = Math.abs(this.jumpHeightStart - this.game.input.x) * this.HEIGHT_SENSITIVITY;
  }

  //calculate jump path & mirror path
  this.points = {
    'x': [ this.x, this.x + this.jumpHeight + (this.jumpHeight * 0.01), this.x],
    'y': [ this.y, (this.y - this.jumpDistance/2), this.y - this.jumpDistance]
  };

  this.mirror.points = {
    'x': [ this.mirror.x, this.mirror.x - this.jumpHeight - (this.jumpHeight * 0.01), this.mirror.x],
    'y': [ this.mirror.y, (this.mirror.y - this.jumpDistance/2), this.mirror.y - this.jumpDistance]
  };

  //redraw guide curve
  if (this.jumpready === true) {
    if (this.lastCurve) {
      this.lastCurve.destroy();
      this.lastCurveMirror.destroy();
    }

    //draw guide curve
    this.drawGuide(this.jumpHeight, this.jumpDistance);
  }
};
