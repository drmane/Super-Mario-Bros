

//Práctica reañizada por Daniel Ruiz Manero

var game = function(){

	
	//Instantiate Quintus
	var Q = window.Q = Quintus({audioSupported: ['ogg']})

		.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")

		.setup()

		.controls().touch().enableSound();

	//LOAD ANIMATIONS
	//###############

	Q.animations("mario_anim",{ //Animations for Mario
		run: {frames: [0,1,2], rate: 1/10},
		stand: { frames: [0], rate: 1/50 },
		jump: { frames: [0], rate: 1/50, loop: false}
	});

	Q.animations("goomba_anim",{ //Animations for Goomba
		move: {frames: [0,1], rate: 1/5},
		die: {frames: [0], rate: 1/5, loop:false, trigger: "death_event"}
	});

	Q.animations("bloopa_anim",{ //Animations for Goomba
		move: {frames: [0,1], rate: 1/5},
		die: {frames: [0], rate: 1/2, loop:false, trigger: "death_event"}
	});

	//LOAD FILES
	//##########

	//Load TMX file (no callback)
	Q.loadTMX("level.tmx",function(){

		//Load SpriteSheet
		Q.load("mario_small.png, mario_small.json, bloopa.png, bloopa.json, goomba.png, goomba.json, princess.png, coin.png, coin.json, mainTitle.png, music_main.ogg, music_level_complete.ogg, bump.ogg, jump.ogg, coin.ogg", function() {

			Q.compileSheets("mario_small.png","mario_small.json");
			Q.compileSheets("goomba.png","goomba.json");
			Q.compileSheets("bloopa.png","bloopa.json");
			Q.compileSheets("coin.png","coin.json");


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
				sprite: "mario_anim",
				frame:0,
				x: 0, // You can also set additional properties that can
				y: 0, // be overridden on object creation
				jumpSpeed: -500
			});

			this.add('2d, platformerControls, animation, tween');

			var mario = this;

			//Jump Animation

			/*
			Q.input.on("up", function(){

				console.log("Event detected");

				if(mario.p.direction == "right" ){
					mario.p.sheet = "marioJump";

					console.log("Jump executed" + mario.p.vx);
				}

				//console.log("Jump executed");
			});

			Q.input.on("left"), function(){

				console.log("Event detected");

				if(mario.p.direction == "right" ){
					mario.p.sheet = "marioJump";

					console.log("Jump executed" + mario.p.vx);
				}

				//console.log("Jump executed");
			});
*/

		},

		step:function(dt){

			//console.log(Q.height);

			
			if(this.p.vy != 0){

				if(this.p.direction == "right" ){
					this.p.sheet = "marioJumpR";
				}
				else if(this.p.direction == "left" ){
					this.p.sheet = "marioJumpL";
				}

				this.play("jump",1);
				Q.audio.play("jump.ogg");
			}
			else if(this.p.vx > 0){
				this.p.sheet = "marioR";
				this.play("run");
			}
			else if(this.p.vx < 0){
				this.p.sheet = "marioL";
				this.play("run")
			}
			else if(this.p.direction == "right" ){
				this.p.sheet = "marioR";
				this.play("stand");
			}
			else if(this.p.direction == "left" ){
				this.p.sheet = "marioL";
				this.play("stand");
			}
				//this.play("stand_" + this.p.direction > 0 ? "right" : "left");
			

			//Death if he falls

			if(this.p.y > Q.height + 180){

				//console.log(Q.height);

				this.destroy();
				Q.stageScene("gameStatusChange",1, { label: "You Died" });
			}


		},

		die: function(){

			this.p.sheet = "marioDie";

			this.del('platformerControls');

			this.animate({y: this.p.y - 50, angle:360},0.5, Q.Easing.Linear, {callback: function(){ this.destroy() } });
		
		}
	});

	Q.Sprite.extend("Princess",{
		// the init constructor is called on creation
		init: function(p) {
		// You can call the parent's constructor with this._super(..)
			this._super(p, {
				asset: "princess.png", // Setting a sprite sheet sets sprite width and height
				frame:0,
				x: 0, // You can also set additional properties that can
				y: 0, // be overridden on object creation
			});

			this.add('2d');

			//Event Listeners
			this.on("hit", function(collision){

				if(collision.obj.isA("Mario")){
					collision.obj.del('platformerControls');
					Q.audio.stop();
					Q.audio.play('music_level_complete.ogg');
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
				sprite: "goomba_anim",
				frame:0,
				x:0,
				y: 0,
				vx: 100
			});


			this.add('2d, aiBounce, animation');

			this.play("move");

			this.on("bump.top", function(collision){

				//console.log("Bump executed");

				if(collision.obj.isA("Mario")){

					//console.log("Mario collision detected");

					this.p.sheet = "goombaDie";
					//console.log("Playimg death");
					this.play("die");
					Q.audio.play('bump.ogg');
					collision.obj.p.vy = -300;
				}

			});

			this.on("bump.left, bump.right, bump.bottom", function(collision){

				//console.log("Bump executed");

				if(collision.obj.isA("Mario")){

					//console.log("Mario collision detected");

					//collision.obj.die();
					Q.stageScene("gameStatusChange",1, { label: "You Died" });
				}

			});

			this.on("death_event", function(){
				this.destroy();
			});
		}
	});

	Q.Sprite.extend("Bloopa",{


		init: function(p){

			this._super(p, {
				sheet: "bloopa",
				sprite: "bloopa_anim",
				frame:0,
				x:0,
				y: 0
			});


			this.add('2d, animation');

			this.play("move");

			//Collision with player

			this.on("bump.top", function(collision){

				//console.log("Bump executed");

				if(collision.obj.isA("Mario")){

					//console.log("Mario collision detected");

					this.p.sheet = "bloopaDie";
					//console.log("Playimg death");
					this.play("die");
					Q.audio.play('bump.ogg');

					collision.obj.p.vy = -300;
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

			this.on("death_event", function(){
				this.destroy();
			});


			this.on("hit", function(collision){

				if(!collision.obj.isA("Mario")){
					//-500 by default
					this.p.vy = -500;

					//console.log("collision detected, v= " + this.p.vy);
				}
			});
			
		}

	});

	Q.Sprite.extend("Coin",{

		init: function(p){

			this._super(p, {
				sheet: "coin",
				frame:0,
				x:0,
				y: 0,
				z:-1,
				angle:0,
				hit: false,
				gravity: 0,
				sensor:true
			});

			this.add("tween");


			this.on("hit", function(collision){

				if(collision.obj.isA("Mario")&&(!this.p.hit)){

					this.p.hit = true;

					Q.state.inc("score",10);

					Q.audio.play('coin.ogg');

					this.animate({y: this.p.y - 50, angle:360},0.2, Q.Easing.Linear, {callback: function(){ this.destroy() } 
					}); 
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

		//Play music
		Q.audio.stop();
		Q.audio.play("music_main.ogg",{loop:true});

		//Load Mario
		var mario = stage.insert(new Q.Mario({x:150,y:510}));

		//Load Enemies
		//var bloopa = stage.insert(new Q.Bloopa());
		var goomba = stage.insert(new Q.Goomba({x:300,y:520}));
		var bloopa = stage.insert(new Q.Bloopa({x:580,y:200}));

		//Load Princess
		var princess = stage.insert(new Q.Princess({x:1000,y:530}));

		//Load Coins
		stage.insert(new Q.Coin({x:630,y:460}));
		stage.insert(new Q.Coin({x:660,y:460}));
		stage.insert(new Q.Coin({x:690,y:460}));
		stage.insert(new Q.Coin({x:720,y:460}));
		stage.insert(new Q.Coin({x:750,y:460}));
		stage.insert(new Q.Coin({x:780,y:460}));

		stage.insert(new Q.Coin({x:630,y:500}));
		stage.insert(new Q.Coin({x:660,y:500}));
		stage.insert(new Q.Coin({x:690,y:500}));
		stage.insert(new Q.Coin({x:720,y:500}));
		stage.insert(new Q.Coin({x:750,y:500}));
		stage.insert(new Q.Coin({x:780,y:500}));


		//Load View Following Mario
		stage.add("viewport").follow(mario,{x:true,y:false});
		stage.centerOn(150,365);

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

			Q.state.reset({ score: 0});
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
			Q.stageScene('HUD',1);
			stage.destroy();
		});

	});

	//Score Text

	Q.UI.Text.extend("Score",{

		init: function(p) {
			this._super({
				label: "Score: 0",
				x: 75,
				y: 0
			});

			Q.state.on("change.score",this,"score");
		},

		score: function(score) {
			this.p.label = "Score: " + score;
		}
	});

	//HUD

	Q.scene('HUD',function(stage) {

		var container = stage.insert(new Q.UI.Container({
			x: 0, y: 0
		}));

		var label = container.insert(new Q.Score());

		//Set to 0 before inc
		Q.state.set("score",0); 
	});

};


		



