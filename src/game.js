

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
	Q.loadTMX("level.tmx",function(){

		//Load SpriteSheet
		Q.load("mario_small.png, mario_small.json, bloopa.png, bloopa.json, goomba.png, goomba.json, princess.png, mainTitle.png", function() {

			Q.compileSheets("mario_small.png","mario_small.json");
			Q.compileSheets("bloopa.png","bloopa.json");
			Q.compileSheets("goomba.png","goomba.json");


			Q.stageScene("mainTitle");
		});
	});


	//ENTITIES
	//########

	Q.Sprite.extend("Mario",{
		// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "marioR", // Setting a sprite sheet sets sprite width and height
				frame:0,
				x: 150, // You can also set additional properties that can
				y: 530, // be overridden on object creation
			});

			this.add('2d, platformerControls');

			console.log(this.p.sheet);

			var mario = this;

			Q.input.on("left", function(){
				mario.p.sheet = "marioL";
			});

			Q.input.on("right", function(){
				mario.p.sheet = "marioR";
			});

			Q.input.on("up", function(){
				mario.p.sheet = "marioJump";
			});
		},

		step:function(dt){

			//console.log(Q.height);

			if(this.p.y > Q.height + 180){

				//console.log(Q.height);

				this.destroy();
				Q.stageScene("gameStatusChange",1, { label: "You Died" });
			}


		}

	});

	Q.Sprite.extend("Princess",{
		// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				asset: "princess.png", // Setting a sprite sheet sets sprite width and height
				frame:0,
				x: 1000, // You can also set additional properties that can
				y: 530, // be overridden on object creation
			});

			this.add('2d');

			//Event Listeners
			this.on("hit", function(collision){

				if(collision.obj.isA("Mario")){
					this.trigger("win");
				}
			});

			//Event Listeners
			this.on("win", function(){


				Q.stageScene("gameStatusChange",1, { label: "You Win" });
			});
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
					Q.stageScene("gameStatusChange",1, { label: "You Died" });
				}

			});
		}
	});

	Q.Sprite.extend("Bloopa",{


		init: function(p){

			this._super(p, {
				sheet: "bloopa",
				frame:0,
				x:600,
				y: 200
			});


			this.add('2d');

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
					Q.stageScene("gameStatusChange",1, { label: "You Died" });

				}

			});


			this.on("hit", function(collision){

				if(!collision.obj.isA("Mario")){
					//-500 by default
					this.p.vy = -600;

					//console.log("collision detected, v= " + this.p.vy);
				}
			});
			
		}

	});

	//SCENES
	//######

	//Create a Scene
	Q.scene("level1",function(stage) {

		//Put the TMX file on the scene
		Q.stageTMX("level.tmx",stage);

		//Load Mario
		var mario = stage.insert(new Q.Mario());

		//Load Enemies
		//var bloopa = stage.insert(new Q.Bloopa());
		var goomba = stage.insert(new Q.Goomba());
		var bloopa = stage.insert(new Q.Bloopa());

		//Load Princess
		var princess = stage.insert(new Q.Princess());

		//Load View Following Mario
		stage.add("viewport").follow(mario);

		//,{x:true,y:true}

		//{x:true,y:false}

		stage.viewport.offsetX = -120;

		stage.viewport.offsetY = 130;

		//The view is on the center
		//stage.add("viewport").centerOn(150,380);


	});

	Q.scene('gameStatusChange',function(stage) {

		//Container

		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));

		//Button
		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
		label: "Play Again" }))

		//Text
		var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
		label: stage.options.label }));

		// Listener
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		// Expand the container to visibily fit it's contents
		// (with a padding of 20 pixels)
		container.fit(20);
	});

	Q.scene('mainTitle',function(stage) {

		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2
		}));

		//Button
		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
		asset: "mainTitle.png" }))

		//Mouse Listener
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		//Enter Listener
		Q.input.on("confirm",this,function(){
			Q.clearStages();
			Q.stageScene('level1');
			stage.destroy();
		});

	});
};


		



