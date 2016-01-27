window.game = window.game || {};

window.game.core = function() {
	var _game = {

		table : {
			// Create the kicker table, units are cm in real
			create: function() {

				_cannon.solidMaterial = _cannon.createPhysicsMaterial(new CANNON.Material('solidMaterial'), 0, 0.1);

				var tableWidth = 68;
				var tableLength = 120;
				var tableHeight = 7;

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(tableWidth, tableLength, 1)),
					mass: 0,
					position: new CANNON.Vec3(0, 0, 0),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(tableWidth, 1, tableHeight)),
					mass: 0,
					position: new CANNON.Vec3(0, -120, tableHeight),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(tableWidth, 1, tableHeight)),
					mass: 0,
					position: new CANNON.Vec3(0, 120, tableHeight),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(1, tableLength, tableHeight)),
					mass: 0,
					position: new CANNON.Vec3(-68, 0, tableHeight),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(1, tableLength, tableHeight)),
					mass: 0,
					position: new CANNON.Vec3(68, 0, tableHeight),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Sphere(1.6),
					mass: 1.6*1.6*1.6 * Math.PI * 4/3 * 5, // Dichte: 5 geraten, Masse = Volumen * Dichte, V(Kugel) = r hoch 3 * Pi*4/3
					position: new CANNON.Vec3(0, 0, 10),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0xffffff }),
					physicsMaterial: _cannon.solidMaterial
				});
			}
		},

		init: function(options) {
			_game.initComponents(options);
			_game.table.create();
			_game.loop();
		},

		destroy: function() {

		},

		loop: function() {
			_animationFrameLoop = window.requestAnimationFrame(_game.loop);
			_cannon.updatePhysics();
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