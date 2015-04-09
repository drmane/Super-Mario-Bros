

//Práctica reañizada por Daniel Ruiz Manero

var game = function(){

	
	//Instantiate Quintus
	var Q = window.Q = Quintus()

		.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")

		.setup()

		.controls().touch();

	//LOAD FILES
	//##########

	//Load TMX file (no callback)
	Q.loadTMX("level.tmx",null);

	//Load SpriteSheet
	Q.load("mario_small.png, mario_small.json, bloopa.png, bloopa.json, goomba.png, goomba.json", function() {

		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("bloopa.png","bloopa.json");
		Q.compileSheets("goomba.png","goomba.json");


		Q.stageScene("level1");
	});


	Q.Sprite.extend("Mario",{
		// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "marioR", // Setting a sprite sheet sets sprite width and height
				frame:0,
				x: 150, // You can also set additional properties that can
				y: 380 // be overridden on object creation
			});

			this.add('2d, platformerControls');
		}

	});

	Q.Sprite.extend("Goomba",{

		init: function(p){

			this._super(p, {
				sheet: "goomba",
				frame:0,
				x:300,
				y: 520,
				vx: 100
			});


			this.add('2d, aiBounce');

			this.on("bump.top", function(collision){

				//console.log("Bump executed");

				if(collision.obj.isA("Mario")){

					//console.log("Mario collision detected");

					this.destroy();
				}

			});

			this.on("bump.left, bump.right, bump.bottom", function(collision){

				//console.log("Bump executed");

				if(collision.obj.isA("Mario")){

					//console.log("Mario collision detected");

					collision.obj.destroy();
				}

			});
		}
	});

	Q.Sprite.extend("Bloopa",{

		init: function(p){

			this._super(p, {
				sheet: "bloopa",
				frame:0,
				x:200,
				y: 380,
				vy: 20
			});


			this.add('2d, aiBounce');

			//Collision with player

			this.on("bump.top", function(collision){

				//console.log("Bump executed");

				if(collision.obj.isA("Mario")){

					//console.log("Mario collision detected");

					this.destroy();
				}

			});

			this.on("bump.left, bump.right, bump.bottom", function(collision){

				//console.log("Bump executed");

				if(collision.obj.isA("Mario")){

					//console.log("Mario collision detected");

					collision.obj.destroy();
				}

			});

			//Collision with floor
		}
	});


	//Create a Scene
	Q.scene("level1",function(stage) {

		//Put the TMX file on the scene
		Q.stageTMX("level.tmx",stage);

		//Load Mario
		var mario = stage.insert(new Q.Mario());

		//Load Enemies
		//var bloopa = stage.insert(new Q.Bloopa());
		var goomba = stage.insert(new Q.Goomba());

		//Load View Following Mario
		stage.add("viewport").follow(mario);

		stage.viewport.offsetX = -140;

		stage.viewport.offsetY = 130;

		//The view is on the center
		//stage.add("viewport").centerOn(150,380);


	});
};
		



