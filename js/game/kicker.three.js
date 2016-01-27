window.game = window.game || {};

window.game.three = function() {
	var _three = {
		domContainer : null,
		cameraSizeConstraint : null,
		camera : null,
		scene : null,
		renderer : null,
		fov : 45,

		init: function(options) {
			_three.domContainer = options && options.domContainer || document.createElement('div');
			_three.cameraSizeConstraint = {
				width: options && options.cameraSizeConstraint && options.cameraSizeConstraint.width || 0,
				height: options && options.cameraSizeConstraint && options.cameraSizeConstraint.height || 0,
			}

			if (!options || !options.domContainer) {
				document.body.appendChild(_three.domContainer);
			}

			_three.setup();

			_three.camera = new THREE.PerspectiveCamera(_three.fov, (window.innerWidth - _three.cameraSizeConstraint.width) / (window.innerHieght - _three.cameraSizeConstraint.height), 1, 150000 );
			// _three.camera.up.set(0, 0, 1);
			_three.camera.position.set(0, 0, 500);
			_three.camera.lookAt(new THREE.Vector3(0, 0, 0));

			_three.renderer = new THREE.WebGLRenderer({ antialias: true });

			if (options && typeof options.rendererClearColor === "number") {
				_three.renderer.setClearColor(options.rendererClearColor, 1);
			}

			_three.onWindowResize();
			window.addEventListener('resize', _three.onWindowResize, false);

			_three.domContainer.appendChild(_three.renderer.domElement);

			var controls = new THREE.OrbitControls(_three.camera, _three.renderer.domElement);

		},

		destroy: function() {

		},

		setup: function() {
			_three.scene = new THREE.Scene();

			if (_three.setupLights) {
				_three.setupLights();
			}
		},

		render: function()  {
			_three.renderer.render(_three.scene, _three.camera);
		},

		onWindowResize: function() {
			_three.camera.aspect = (window.innerWidth - _three.cameraSizeConstraint.width) / (window.innerHeight - _three.cameraSizeConstraint.height);
			_three.camera.updateProjectionMatrix();
			_three.renderer.setSize((window.innerWidth - _three.cameraSizeConstraint.width), (window.innerHeight - _three.cameraSizeConstraint.height));
		}
	};

	return _three;
}
