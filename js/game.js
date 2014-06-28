"use strict";

/* global Phaser:true */

var GameState = function() { };

var JUMP_SPEED = 50;
var GRAVITY = 230;
var HORIZONTAL_SPEED = 60;
var MAX_SPEED = GRAVITY * 4;
var SPACE_BETWEEN_ROCKS = 900;
var SPACE_BETWEEN_STARS = 100;
var MAX_VERTICAL_STARS = 4;
var GAME_WIDTH_MULTIPLIER = 5;

function Hero(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'gameart');

  this.anchor.x = 0.5;
  this.anchor.y = 0.5;
  this.x = x;
  this.y = y;

  var frames = [
    'lxjs-1.png',
    'lxjs-2.png',
    'lxjs-1.png',
    'lxjs-2.png',
    'lxjs-3.png',
    'lxjs-2.png',
    'lxjs-1.png',
    'lxjs-2.png',
    'lxjs-1.png',
    'lxjs-2.png'];
  this.animations.add('swim', frames, 8, true, false);
  this.animations.play('swim');

  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;

  this.body.setSize(305, 80, 0, 7);

  var spacekey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  spacekey.onDown.add(this.swimup, this);
}
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.swimup = function () {
  if (this.body.velocity.y < MAX_SPEED) {
    this.body.velocity.y -= JUMP_SPEED;
  }
};
Hero.prototype.boom = function () {
  //TODO: handle the player colliding and dying
};

GameState.prototype = {
  preload: function () {
    this.game.load.atlas('gameart', 'assets/sprites.png', 'assets/sprites.json');
  },
  create: function () {
    this.game.physics.arcade.gravity.y = GRAVITY;
    this.game.physics.arcade.gravity.x = HORIZONTAL_SPEED;

    this.bgLayer = game.add.group();
    this.fgLayer = game.add.group();


    this.hero = new Hero(this.game, 350, this.game.height / 2);
    this.game.add.existing(this.hero);
    this.game.camera.follow(this.hero);
    this.fgLayer.add(this.hero);

    this.buildWorld();
  },
  update: function () {
    for (var i=0, ii=this.rocks.length; i<ii; i++) {
      this.game.physics.arcade.collide(this.hero, this.rocks[i], this.hero.boom, null, this.hero);
    }
  },
  addRock: function (x, upsideDown) {
    var rock = new Phaser.Sprite(this.game, 0, 0, 'gameart', 'lxjs-rock.png');
    var delta = (300 * Math.random());
    var y = upsideDown ? 345 - delta : this.game.height - delta;
    this.game.add.existing(rock);
    this.fgLayer.add(rock);

    this.game.physics.enable(rock, Phaser.Physics.ARCADE);
    rock.body.immovable = true;
    rock.body.allowGravity = false;
    rock.anchor.x = 0.5;
    rock.anchor.y = 0.5;
    rock.scale.x = 0.5;
    rock.x = x;
    rock.y = y;
    // going use a smaller rock size since I don't
    // want to use a more complex physics engine that
    // supports arbitary shapes
    rock.body.setSize(162,690,0,0);
    if (upsideDown) {
      rock.angle = 180;
    }
    this.rocks.push(rock);
  },
  addStar: function (x, y) {
    var star = this.game.add.sprite(x, y, 'gameart');
    var scale = Math.max(0.3, Math.random());
    star.scale.x = scale;
    star.scale.y = scale;
    star.animations.add('sparkle', ['lxjs-star-1.png', 'lxjs-star-2.png'], 8, true, false);
    star.animations.play('sparkle');
    this.bgLayer.add(star);
  },
  buildWorld: function () {
    var challengeWidth = this.game.width * GAME_WIDTH_MULTIPLIER;
    var worldWidth = challengeWidth + this.game.width;
    var upsideDown = false;
    var x = SPACE_BETWEEN_ROCKS;

    this.game.world.setBounds(0, 0, worldWidth, this.game.height);

    this.rocks = [];
    while(x< challengeWidth) {
      this.addRock(x, upsideDown);
      upsideDown = !upsideDown;
      x += SPACE_BETWEEN_ROCKS;
    }
    var vOffsets = [this.game.height];
    for (var o=1;o<=MAX_VERTICAL_STARS;o++) {
      vOffsets[o] = this.game.height / o;
    }
    x = 0;
    while(x < worldWidth) {
      var starCount = 1 + ~~(MAX_VERTICAL_STARS * Math.random());
      var offset = ~~(Math.random() * vOffsets[starCount]);
      for(var j=0; j<starCount; j++) {
        this.addStar(x, offset + (offset * j));
      }
      x += SPACE_BETWEEN_STARS;
    }
    this.game.add.sprite(worldWidth - 135, this.game.height - 45, 'gameart', 'lxjs-laptop.png');
    var coffee = this.game.add.sprite(worldWidth - 175, this.game.height - 45, 'gameart', 'lxjs-cup-1.png');
    coffee.animations.add('steam', ['lxjs-cup-1.png', 'lxjs-cup-2.png'], 8, true, false);
    coffee.animations.play('steam');
  }
};

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');
game.state.add('runtime' , GameState);
game.state.start('runtime');