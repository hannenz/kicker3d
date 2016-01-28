window.game = window.game || {};

window.game.core = function() {
	var ball;
	var _game = {

		numberOfBalls : 50,

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
				if (_events.keyboard.pressed['ESC']) {
					_game.play();
				}

				_game.poles.playerA[0].pole.position.x = (-_game.table.tableWidth / 2) + (_game.table.tableWidth * _events.mouse.xPerc);
			}
		},

		table : {

			tableWidth: 68,

			tableLength: 120,

			tableHeight: 7,

			// Create the kicker table, units are cm in real
			create: function() {

				_cannon.solidMaterial = _cannon.createPhysicsMaterial(new CANNON.Material('solidMaterial'), 0, 0.1);


				/*************
				 * THE TABLE *
				 *************/

				// Ground

				var ground = _cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(_game.table.tableWidth / 2, _game.table.tableLength / 2, 0.5)),
					mass: 0,
					position: new CANNON.Vec3(0, 0, 0),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
					physicsMaterial: _cannon.solidMaterial,
				});
				var texture = THREE.ImageUtils.loadTexture('img/kicker_carpet.svg', {}, function() {

					ground.visualref.material = new THREE.MeshLambertMaterial({ map: texture});
					
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
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(0.5, _game.table.tableLength / 2, _game.table.tableHeight / 2)),
					mass: 0,
					position: new CANNON.Vec3(-_game.table.tableWidth / 2, 0, _game.table.tableHeight / 2),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(0.5, _game.table.tableLength / 2, _game.table.tableHeight / 2)),
					mass: 0,
					position: new CANNON.Vec3(_game.table.tableWidth / 2, 0, _game.table.tableHeight / 2),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
					physicsMaterial: _cannon.solidMaterial
				});


				// A pole
				var pole = _cannon.createRigidBody({
					shape: new CANNON.Cylinder(0.5, 0.5, 100, 32),
					mass: 0,
					position: new CANNON.Vec3(0, 0, _game.table.tableHeight - 2),
					meshMaterial: new THREE.MeshLambertMaterial({ color : 0xcccccc }),
					physicsMaterial: _cannon.solidMaterial
				});
				pole.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);

				// Create Players for pole
				var players = [];
				for (i = 0; i < 3; i++) {
					var player = _cannon.createRigidBody({
						shape: new CANNON.Box(new CANNON.Vec3(2, 0.75, 3.5)),
						mass: 0,
						position: new CANNON.Vec3((i - 1) * 15, 0, 5),
						meshMaterial: new THREE.MeshLambertMaterial({ color: 0xc00000 }),
						physicsMaterial: _cannon.solidMaterial
					});
					player.angularVelocity.set(100, 0, 0);

					var cnstr = new CANNON.LockConstraint(player, pole);
					_cannon.world.addConstraint(cnstr);

					players.push(player);
				}

				_game.poles.playerA.push({ pole: pole, players: players});
				console.debug(_game.poles);
			}
		},

		init: function(options) {
			_game.initComponents(options);
			_game.table.create();
			_game.loop();
		},

		play: function() {

			// Play balls!

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