//this is what gives the world its terrain based on input
var terrain = require('voxel-perlin-terrain')
var chunkSize = 32

var seed = prompt("Please enter a word or phrase without spaces")
// initialize your noise with a seed, floor height, ceiling height and scale factor
var generateChunk = terrain(seed, 0, 5, 10)

var walk = require('voxel-walk')

//this initializes the voxel engine
var createEngine = require('voxel-engine')

//then you call the engine with the options you want to use
var game = createEngine({
	texturePath: 'textures/',
	generateChunks: false,
	playerSkin: 'textures/viking.png',
	//materials: [ 'grass_top', 'tree_side', 'leaves_opaque' ]
})
game.appendTo(document.body)

//Add a player to the world
var createPlayer = require('voxel-player')(game)

var player = createPlayer('textures/viking.png')
player.possess()
player.yaw.position.set(0,10,0)

//this creates more terrain as you move further into the world
game.voxels.on('missingChunk', function(p) {
  var voxels = generateChunk(p, chunkSize)
  var chunk = {
    position: p,
    dims: [chunkSize, chunkSize, chunkSize],
    voxels: voxels
  }
  game.showChunk(chunk)
})

var highlight = require('voxel-highlight')

// highlight blocks when you look at them, hold <Ctrl> for block placement
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, { color: 0xff0000 })
  hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
  hl.on('remove', function (voxelPos) { blockPosErase = null })
  hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
  hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

var target = game.controls.target()
 // block interaction stuff, uses highlight data
  var currentMaterial = 1

game.on('fire', function (target, state) {
    var position = blockPosPlace
    if (position) {
      game.createBlock(position, currentMaterial)
    }
    else {
      position = blockPosErase
      if (position) game.setBlock(position, 0)
    }
  })

  game.on('tick', function() {
    walk.render(target.playerSkin)
    var vx = Math.abs(target.velocity.x)
    var vz = Math.abs(target.velocity.z)
    if (vx > 0.001 || vz > 0.001) walk.stopWalking()
    else walk.startWalking()
  })
  
//Used for adding trees to the world
var createTree = require('voxel-forest');
for (var i = 0; i < 10; i++) {
    createTree(game, { bark: 2, leaves: 3 });
}