window.game = window.game || {};

window.game.core = function() {
	var ball;
	var _game = {

		rot: 0,

		numberOfBalls : 25,

		poles : {
			playerA : [],
			playerB : []
		},

		balls : [],

		player : {
			update: function() {
				_game.player.processUserInput();
			},

			processUserInput: function() {

				// return;

				if (_game.poles.playerA.length > 0) {

					if (_events.keyboard.pressed['ESC']) {
						_game.play();
					}
					if (_events.keyboard.pressed['space']) {
						console.debug(_game.poles.playerA[0].pole.velocity);
					 	_game.poles.playerA[0].pole.applyForce(new CANNON.Vec3(100, 0, 0), new CANNON.Vec3(0.25, 0, 0));

					}

					// return ;

					var x = (-_game.table.tableWidth / 2) + (_game.table.tableWidth * _events.mouse.xPerc);
					if (x < -7.4) {
						x = -7.4;
					}
					if (x > 7.4) {
						x = 7.4;
					}

					_game.poles.playerA[0].pole.position.x = x;

					// if (_events.mouse.wheel > 0) {
					// 	console.debug ('Applying impulse to pole');
					// 	_game.poles.playerA[0].pole.applyForce(new CANNON.Vec3(0, 0, 100), new CANNON.Vec3(0.25, 0, 0));
					// }
				}
			}
		},

		table : {

			tableWidth: 68,

			tableLength: 120,

			tableHeight: 7,

			// Create the kicker table, units are cm in real
			create: function() {

				_cannon.solidMaterial = _cannon.createPhysicsMaterial(new CANNON.Material('solidMaterial'), 0.3, 0.1);


				/*************
				 * THE TABLE *
				 *************/

				var textureLoader = new THREE.TextureLoader();
				textureLoader.load(
					'img/kicker_carpet.svg', 
					function(texture) {

						var material = new THREE.MeshLambertMaterial({
							map: texture
						});

						// Ground
						var ground = _cannon.createRigidBody({
							shape: new CANNON.Box(new CANNON.Vec3(_game.table.tableWidth / 2, _game.table.tableLength / 2, 0.5)),
							mass: 0,
							position: new CANNON.Vec3(0, 0, 0),
							physicsMaterial: _cannon.solidMaterial,
							meshMaterial: material,
						});

						// Walls short
						_cannon.createRigidBody({
							shape: new CANNON.Box(new CANNON.Vec3(_game.table.tableWidth / 2 + 0.5, 0.5, _game.table.tableHeight / 2)),
							mass: 0,
							position: new CANNON.Vec3(0, -_game.table.tableLength / 2, _game.table.tableHeight / 2),
							meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
							physicsMaterial: _cannon.solidMaterial
						});

						_cannon.createRigidBody({
							shape: new CANNON.Box(new CANNON.Vec3(_game.table.tableWidth / 2 + 0.5, 0.5, _game.table.tableHeight / 2)),
							mass: 0,
							position: new CANNON.Vec3(0, _game.table.tableLength / 2, _game.table.tableHeight / 2),
							meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
							physicsMaterial: _cannon.solidMaterial
						});

						// Walls long
						var sideWall1 = _cannon.createRigidBody({
							shape: new CANNON.Box(new CANNON.Vec3(0.5, _game.table.tableLength / 2, _game.table.tableHeight / 2)),
							mass: 0,
							position: new CANNON.Vec3(-_game.table.tableWidth / 2, 0, _game.table.tableHeight / 2),
							meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
							physicsMaterial: _cannon.solidMaterial
						});

						var sideWall2 = _cannon.createRigidBody({
							shape: new CANNON.Box(new CANNON.Vec3(0.5, _game.table.tableLength / 2, _game.table.tableHeight / 2)),
							mass: 0,
							position: new CANNON.Vec3(_game.table.tableWidth / 2, 0, _game.table.tableHeight / 2),
							meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
							physicsMaterial: _cannon.solidMaterial
						});

						var poleCompound = new CANNON.Body({mass: 250 });
						poleCompound.position.set(0, 0, _game.table.tableHeight + 1);
						
						var pole = new CANNON.Cylinder(0.5, 0.5, _game.table.tableWidth, 32);
						var q = new CANNON.Quaternion();
						q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
						poleCompound.addShape(pole, new CANNON.Vec3(0, 0, 0), q);

						for (i = 0; i < 5; i++) {
							var player = new CANNON.Box(new CANNON.Vec3(2, 0.75, 3.5));
							poleCompound.addShape(player, new CANNON.Vec3((i - 2) * 12, 0, 0));
						}

						var c1 = new CANNON.HingeConstraint(sideWall1, poleCompound, {
							pivotA: new CANNON.Vec3(0.5, 0, 1),
							axisA : new CANNON.Vec3(1, 0, 0),
							// pivotB: new CANNON.Vec3(-45, 0, 0),
							pivotB: new CANNON.Vec3(-34, 0, 0),
							// axisB : new CANNON.Vec3(1, 0, 0),
							collideConnected: false
						});

						var c2 = new CANNON.HingeConstraint(sideWall2, poleCompound, {
							pivotA: new CANNON.Vec3(0.5, 0, 1),
							axisA : new CANNON.Vec3(1, 0, 0),
							// pivotB: new CANNON.Vec3(45, 0, 0),
							pivotB: new CANNON.Vec3(34, 0, 0),
							// axisB : new CANNON.Vec3(1, 0, 0),
							collideConnected: false
						});

						_cannon.world.addConstraint(c1);
						_cannon.world.addConstraint(c2);



						_cannon.addVisual(poleCompound, new THREE.MeshLambertMaterial({ color : 0xcccccc }));
						_cannon.world.addBody(poleCompound);

						// poleCompound.addEventListener('collide', function(e){

						// 	if (e.body == sideWall1) {
						// 		console.debug ('IT WAS THE LEFT SIDE WALL!');
						// 	}
						// });

						_game.poles.playerA.push({ pole: poleCompound });
					},
					function(xhr) {
						console.debug('Loading progresses');
					},
					function(xhr) {
						console.debug('Error loading texture');
					}
				);
			}
		},

		init: function(options) {
			_game.initComponents(options);
			_game.table.create();
			_game.loop();
		},

		play: function() {

			//Play balls!

			for (i = 0; i < _game.balls.length; i++) {

				_cannon.removeVisual(_game.balls[i]);

				_three.scene.remove(_game.balls[i].visualref);
				_cannon.world.remove(_game.balls[i]);
			}
			_game.balls = Array();

			for (var i = 0; i < _game.numberOfBalls; i++) {

				var x = (_game.table.tableWidth / 2) - (Math.random() * (_game.table.tableWidth - 20) + 10);
				var y = (_game.table.tableLength / 2) - (Math.random() * (_game.table.tableLength - 20) + 10);
				var z = Math.random() * 10;

				ball = _cannon.createRigidBody({
					shape: new CANNON.Sphere(1.5),
					mass: 1.6*1.6*1.6 * Math.PI * 4/3 * 5, // Dichte: 5 geraten, Masse = Volumen * Dichte, V(Kugel) = r hoch 3 * Pi*4/3
					//mass: 1,
					position: new CANNON.Vec3(x, y, z),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0xffffff }),
					physicsMaterial: _cannon.solidMaterial
				});
				ball.angularVelocity.set(25 - (Math.random() * 50), 25 - (Math.random() * 50), 25 - (Math.random() * 50));
				_game.balls.push(ball);
			}
		},

		destroy: function() {

		},

		loop: function() {
			_animationFrameLoop = window.requestAnimationFrame(_game.loop);
			_cannon.updatePhysics();
			_game.player.update();
			_three.render();
		},

		initComponents: function(options) {
			_events = window.game.events();
			_three = window.game.three();
			_cannon = window.game.cannon();

			_three.setupLights = function() {

				var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
				hemiLight.position.set(0, 0, -1);
				_three.scene.add(hemiLight);

				var pointLight = new THREE.PointLight(0xffffff, 0.5);
				pointLight.position.set(0, 0, 500);
				_three.scene.add(pointLight);

				var dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
				dirLight.castShadow = true;
				dirLight.position.x = 0;
				dirLight.position.y = 0;
				dirLight.position.z = 200;
				_three.scene.add(dirLight);
			}

			_three.init(options);
			_cannon.init(_three);
			_events.init();
		}
	};

	var _events;
	var _three;
	var _cannon;
	var _animationFrameLoop;

	return _game;
}