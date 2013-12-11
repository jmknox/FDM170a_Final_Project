//include all of the modules we'll need
var createPerlin = require('voxel-perlin-terrain');
var createSimplex = require('voxel-simplex-terrain');
//this initializes the voxel engine
var createEngine = require('voxel-engine');
var highlight = require('voxel-highlight');
var walk = require('voxel-walk');

var generateChunk;
var game;
var createPlayer;
var player;
var createSky;
var sky;

var chunkSize = 32;
var mats;
var wantsnow;
var wanttrees;

var type;
var seed;
var floor;
var ceiling;
var scale;
var height;
var width;
var cubesize;

function generate()
{
	$('div').remove();
	$('canvas').remove();
	var selected = document.getElementById('type')
	type = selected.options[selected.selectedIndex].text;
	if(type == 'Sphere'){
		height = document.getElementById('sheight').value;
		width = document.getElementById('swidth').value;
		wantsnow = document.getElementById('ssnow').checked;
	}
	if(type == 'Perlin'){
		seed = document.getElementById('pseed').value;
		floor = document.getElementById('floor').value;
		ceiling = document.getElementById('ceiling').value;
		scale = document.getElementById('pscale').value;
	}
	if(type == 'Flat'){
		wantsnow = document.getElementById('fsnow').checked;
		//wanttrees = document.getElementById('trees').checked;
	}if(type == 'Simplex'){
		seed = document.getElementById('sseed').value;
		scale = document.getElementById('sscale').value;
		cubesize = document.getElementById('cubesize').value;
		chunkDist = document.getElementById('chunkdist').value;
	}
	everythingelse();
}

function everythingelse()
{
	var terraintype;
	var genChunks = true
	mats = [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt'];
	if(type == 'Sphere'){
		terraintype = function(x,y,z) {
			return x*x+y*y+z*z <= height*width ? 1 : 0 // sphere world
		};
		if(wantsnow == true) mats = [['whitewool', 'dirt', 'grass_dirt'], 'grass', 'plank'];
	}else if(type == 'Perlin'){
		// initialize your noise with a seed, floor height, ceiling height and scale factor
		terraintype = createPerlin(seed, floor, ceiling, scale);
		genChunks = false;
	}else if(type == 'Flat'){
		terraintype = function(x, y, z) {
			return y === 1 ? 1 : 0
		};
		if(wantsnow == true) mats = [['whitewool', 'dirt', 'grass_dirt'], 'grass', 'plank'];
		//if(wantsnow == true && wantttree == true) mats = [['whitewool', 'dirt', 'grass_dirt'], 'grass_top', 'tree_side', 'leaves_opaque'];
	}else if(type == 'Simplex'){
		terraintype = createSimplex(seed, scale, chunkDist);
		mats = ['grass', 'obsidian', 'dirt', 'whitewool', 'crate', 'brick'];
	}	
	

//then you call the engine with the options you want to use
//if(type == 'Simplex'){ 
//	game = createEngine({
//		generateVoxelChunk: terraintype,
//		generateChunks: genChunks,
//		chunkDistance: chunkDist,
//		cubeSize: cubesize,
//		texturePath: 'textures/',
//		playerSkin: 'textures/viking.png',
//		materials: mats,
//		lightsDisabled: true,
//		fogDisabled: true,
//	});
//}else{
	game = createEngine({
		generate: terraintype,
		generateChunks: genChunks,
		chunkDistance: 2,
		texturePath: 'textures/',
		playerSkin: 'textures/viking.png',
		materials: mats,
		lightsDisabled: true,
		fogDisabled: true,
	});
//}
game.appendTo(document.body);

if(type == 'Perlin'){
	//this creates more terrain as you move further into the world
	game.voxels.on('missingChunk', function(p) {
	  var voxels = terraintype(p, chunkSize);
	  var chunk = {
		position: p,
		dims: [chunkSize, chunkSize, chunkSize],
		voxels: voxels
	  };
	  game.showChunk(chunk);
	});
}

if(type != 'Perlin' && type != 'Simplex' && wantsnow == true){
	var snow = require('voxel-snow')({
	  // pass it a copy of the game
	  game: game,
	  // how many particles of snow
	  count: 1000,
	  // size of snowfall
	  size: 20,
	  // speed it falls
	  speed: 0.1,
	  // speed it drifts
	  drift: 1,
	  // material of the particle
	  material: new game.THREE.ParticleBasicMaterial({color: 0xffffff, size: 1})
	});

	game.on('tick', function() {
	  // update the snow by calling tick
	  snow.tick();
	});
}

/*
if(type == 'Flat' && wanttrees)}
	var createTree = require('voxel-forest');
	for (var i = 0; i < 5; i++) {
		createTree(game, { bark: 3, leaves: 4 });
	}
}*/

//Add a player to the world
createPlayer = require('voxel-player')(game);

player = createPlayer('textures/viking.png');
player.possess();
player.yaw.position.set(0,25,0);

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

//document.getElementById('gen').addEventListener("click", generate, false);
generate();


