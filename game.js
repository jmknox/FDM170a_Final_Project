//include all of the modules we'll need
var createTerrain = require('voxel-perlin-terrain');
var walk = require('voxel-walk');
//this initializes the voxel engine
var createEngine = require('voxel-engine');
var highlight = require('voxel-highlight');

var generateChunk;
var game;
var createPlayer;
var player;
var createSky;
var sky;

var chunkSize = 32;

var seed;
var floor;
var ceiling;
var scale;

function generate()
{
	if(generateChunk != null) generateChunk = null;
	if(game != null) game = null;
	if(createPlayer != null) createPlayer = null;
	if(player != null) player = null;
	if(createSky != null) createSky = null;
	if(sky != null) sky = null;
	$('div').remove();
	$('canvas').remove();
	seed = document.getElementById('seed').value;
	floor = document.getElementById('floor').value;
	ceiling = document.getElementById('ceiling').value;
	scale = document.getElementById('scale').value;
	everythingelse();
}

function everythingelse()
{
//then you call the engine with the options you want to use
game = createEngine({
	generateChunks: false,
	chunkDistance: 2,
	texturePath: 'textures/',
	playerSkin: 'textures/viking.png',
	materials: [['grass', 'dirt', 'grass_dirt'], 'tree_side', 'leaves_opaque'],
	lightsDisabled: true,
	fogDisabled: true,
});
game.appendTo(document.body);

// initialize your noise with a seed, floor height, ceiling height and scale factor
var generateChunk = createTerrain(seed, floor, ceiling, scale)

//this creates more terrain as you move further into the world
game.voxels.on('missingChunk', function(p) {
  var voxels = generateChunk(p, chunkSize);
  var chunk = {
    position: p,
    dims: [chunkSize, chunkSize, chunkSize],
    voxels: voxels
  };
  game.showChunk(chunk);
});

//Add a player to the world
createPlayer = require('voxel-player')(game);

player = createPlayer('textures/viking.png');
player.possess();
player.yaw.position.set(0,10,0);

// create a sky
createSky = require('voxel-sky')(game);

sky = createSky();
game.on('tick', sky);

// highlight blocks when you look at them, hold <Ctrl> for block placement
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, { color: 0xff0000 })
  hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
  hl.on('remove', function (voxelPos) { blockPosErase = null })
  hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
  hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

var target = game.controls.target();
 // block interaction stuff, uses highlight data
  var currentMaterial = 1;

game.on('fire', function (target, state) {
    var position = blockPosPlace;
    if (position) {
      game.createBlock(position, currentMaterial);
    }
    else {
      position = blockPosErase;
      if (position) game.setBlock(position, 0);
    }
  });

  game.on('tick', function() {
    walk.render(target.playerSkin);
    var vx = Math.abs(target.velocity.x);
    var vz = Math.abs(target.velocity.z);
    if (vx > 0.001 || vz > 0.001) walk.stopWalking();
    else walk.startWalking();
  });
  

game.paused = false

}

document.getElementById('gen').addEventListener("click", generate, false); 



