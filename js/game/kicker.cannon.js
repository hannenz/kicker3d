window.game = window.game || {};

window.game.cannon = function() {
	var _cannon = {

		world : null,
		bodies : [],
		visuals : [],
		bodyCount : 0,
		friction : 0,
		restitution: 0.0,
		gravity: -10,
		timestep: 1 / 8,
		solidMaterial: null,

		init : function(three) {
			_cannon.setup();
			_three = three;
		},

		destroy : function() {
			_cannon.removeAllVisuals();
		},

		setup : function() {
			_cannon.world = new CANNON.World();
			_cannon.world.gravity.set(0, 0, _cannon.gravity);
			_cannon.world.broadphase = new CANNON.NaiveBroadphase();
			_cannon.world.solver.iterations = 5;

			_cannon.bodies = [];
			_cannon.visuals = [];
			_cannon.bodyCount = 0;
		},

		createRigidBody: function(options) {

			var body = new CANNON.Body({
				mass: options.mass,
				shape: options.shape,
				material: options.physicsMaterial,
			});

			body.position.set(options.position.x, options.position.y, options.position.z);

			if (options.rotation) {
				body.quaternion.setFromAxisAngle(options.rotation[0], options.rotation[1]);
			}

			_cannon.addVisual(body, options.meshMaterial, options.customMesh);

			return body;
		},

		createPhysicsMaterial: function(material, friction, restitution) {
			var physicsMaterial = material || new CANNON.Material();
			var contactMaterial = new CANNON.ContactMaterial(physicsMaterial, new CANNON.Material(), {
				friction: friction || _cannon.friction,
				restitution: restitution || _cannon.restitution
			});

			_cannon.world.addContactMaterial(contactMaterial);

			return physicsMaterial;
		},

		addVisual: function(body, material, customMesh) {
			var mesh = customMesh || null;

			if (body instanceof CANNON.Body && !mesh) {
				mesh = _cannon.shape2mesh(body, material);
			}

			if (mesh) {
//				mesh.rotation.x = Math.PI / 2;
				_cannon.bodies.push(body);
				_cannon.visuals.push(mesh);

				body.visualref = mesh;
				body.visualref.visualId = _cannon.bodies.length - 1;

				mesh.position.copy(body.position);

				_three.scene.add(mesh);
				_cannon.world.add(body);
			}
		},

		removeVisual: function(body) {
			if (body.visualref) {
				var old_b = [];
				var old_v = [];
				var n = _cannon.bodies.length;

				for (var i = 0; i < n; i++) {
					old_b.unshift(_cannon.bodies.pop());
					old_v.unshift(_cannon.visuals.pop());
				}

				var id = body.visualref.visualId;

				for (var j = 0; j < old_b.length; j++) {
					if (j !== id) {
						var i = j > id ? j - 1 : j;
						_cannon.bodies[i] = old_b[j];
						_cannon.visuals[i] = old_v[j];
						_cannon.bodies[i].visualref = old_b[j].visualref;
						_cannon.bodies[i].visualref.visualId = i;
					}
				}

				body.visualref.visualId = null;
				_three.scene.remove(body.visualref);
				body.visualref = null;
				_cannon.world.remove(body);
			}
		},

		removeAllVisuals : function() {
			_cannon.bodies.forEach(function(body) {
				if (body.visualref) {
					body.visualref.visualId = null;
					_three.scene.remove(body.visualref);
					body.visualref = null;
					_cannon.world.remove(body);
				}
			});
			_cannon.bodies = [];
			_cannon.visuals = [];
		},

		updatePhysics: function() {
			_cannon.bodyCount = _cannon.bodies.length;

			for (var i = 0; i < _cannon.bodyCount; i++) {
				var body = _cannon.bodies[i], visual = _cannon.visuals[i];

				// Copy FROM visual TO body...
				// console.debug(body.position);
				// body.position.copy(visual.position);
				// console.debug(body.position);

				visual.position.x = body.position.x;
				visual.position.y = body.position.y;
				visual.position.z = body.position.z;

				if (visual.quaternion) {
//					body.quaternion.copy(visual.quaternion);
					visual.quaternion.copy(body.quaternion);
				}
			}

			_cannon.world.step(_cannon.timestep);
		},


		shape2mesh: function(body, currentMaterial) {
			var submesh;
			var obj = new THREE.Object3D();

			for (var l = 0; l < body.shapes.length; l++) {

				var shape = body.shapes[l];
				var mesh;

				switch (shape.type){
					case CANNON.Shape.types.SPHERE:
						var sphere_geometry = new THREE.SphereGeometry(shape.radius, 16, 16);
						mesh = new THREE.Mesh(sphere_geometry, currentMaterial);
						mesh.castShadow = true;
						mesh.receiveShadow = true;
						break;

					case CANNON.Shape.types.PLANE:
						var geometry = new THREE.PlaneGeometry(100, 100);
						mesh = new THREE.Object3D();
						submesh = new THREE.Object3D();
						var ground = new THREE.Mesh(geometry, currentMaterial);
						ground.scale = new THREE.Vector3(1000, 1000, 1000);
						submesh.add(ground);

						ground.castShadow = true;
						ground.receiveShadow = true;

						mesh.add(submesh);
						break;

					case CANNON.Shape.types.BOX:
						var box_geometry = new THREE.CubeGeometry(
								shape.halfExtents.x * 2,
								shape.halfExtents.y * 2,
								shape.halfExtents.z * 2
							);
						mesh = new THREE.Mesh(box_geometry, currentMaterial);
						mesh.castShadow = true;
						mesh.receiveShadow = true;
						break;

					// case CANNON.Shape.types.COMPOUND:
					// 	// recursive compounds
					// 	var o3d = new THREE.Object3D();
					// 	for(var i = 0; i<shape.childShapes.length; i++){

					// 		// Get child information
					// 		var subshape = shape.childShapes[i];
					// 		var o = shape.childOffsets[i];
					// 		var q = shape.childOrientations[i];

					// 		submesh = _cannon.shape2mesh(subshape);
					// 		submesh.position.set(o.x,o.y,o.z);
					// 		submesh.quaternion.set(q.x,q.y,q.z,q.w);

					// 		submesh.useQuaternion = true;
					// 		o3d.add(submesh);
					// 		mesh = o3d;
					// 	}
					// 	break;

					case CANNON.Shape.types.CONVEXPOLYHEDRON:
					case CANNON.Shape.types.CYLINDER:
			            var geo = new THREE.Geometry();

			            // Add vertices
			            for (var i = 0; i < shape.vertices.length; i++) {
			                var v = shape.vertices[i];
			                geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
			            }

			            for(var i=0; i < shape.faces.length; i++){
			                var face = shape.faces[i];

			                // add triangles
			                var a = face[0];
			                for (var j = 1; j < face.length - 1; j++) {
			                    var b = face[j];
			                    var c = face[j + 1];
			                    geo.faces.push(new THREE.Face3(a, b, c));
			                }
			            }
			            geo.computeBoundingSphere();
			            geo.computeFaceNormals();
			            mesh = new THREE.Mesh( geo, currentMaterial );


					// 	/* FIXME: use variable parameters!!! */
						// var cylinder_geometry = new THREE.CylinderGeometry(0.5, 0.5, 100, 32);
						// mesh = new THREE.Mesh(cylinder_geometry, currentMaterial);
						// mesh.castShadow = true;
						// mesh.receiveShadow = true;
						break;

					default:
						throw "Visual type not recognized: " + shape.type;
				}

				mesh.receiveShadow = true;
				mesh.castShadow = true;

				if (mesh.children) {
					for (var j = 0; j < mesh.children.length; j++) {
						mesh.children[j].castShadow = true;
						mesh.children[j].receiveShadow = true;

						if (mesh.children[j]){
							for(var k = 0; k < mesh.children[j].length; k++) {
								mesh.children[j].children[k].castShadow = true;
								mesh.children[j].children[k].receiveShadow = true;
							}
						}
					}
				}

				var o = body.shapeOffsets[l];
				var q = body.shapeOrientations[l];
				mesh.position.set(o.x, o.y, o.z);
				mesh.quaternion.set(q.x, q.y, q.z, q.w);

				obj.add(mesh);
			}

			return obj;
		},

		showAABBs: function() {
			// Show axis-aligned bounding boxes for debugging purposes - Cannon.js uses bounding spheres by default for its collision detection
			var that = this;

			var GeometryCache = function(createFunc) {
				var that = this, geo = null, geometries = [], gone = [];

				that.request = function() {
					if (geometries.length) {
						geo = geometries.pop();
					} else {
						geo = createFunc();
					}

					_three.scene.add(geo);
					gone.push(geo);

					return geo;
				};

				that.restart = function() {
					while(gone.length) {
						geometries.push(gone.pop());
					}
				};

				that.hideCached = function() {
					for (var i = 0; i < geometries.length; i++) {
						_three.scene.remove(geometries[i]);
					}
				}
			};

			var bboxGeometry = new THREE.CubeGeometry(1, 1, 1);

			var bboxMaterial = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				wireframe: true
			});

			var bboxMeshCache = new GeometryCache(function() {
				return new THREE.Mesh(bboxGeometry, bboxMaterial);
			});

			that.update = function() {
				bboxMeshCache.restart();

				for (var i = 0; i < _cannon.bodies.length; i++) {
					var b = _cannon.bodies[i];

					if (b.computeAABB) {
						if(b.aabbNeedsUpdate){
							b.computeAABB();
						}

						if (isFinite(b.aabbmax.x) &&
							isFinite(b.aabbmax.y) &&
							isFinite(b.aabbmax.z) &&
							isFinite(b.aabbmin.x) &&
							isFinite(b.aabbmin.y) &&
							isFinite(b.aabbmin.z) &&
							b.aabbmax.x - b.aabbmin.x != 0 &&
							b.aabbmax.y - b.aabbmin.y != 0 &&
							b.aabbmax.z - b.aabbmin.z != 0) {
							var mesh = bboxMeshCache.request();

							mesh.scale.set(b.aabbmax.x - b.aabbmin.x,
									b.aabbmax.y - b.aabbmin.y,
									b.aabbmax.z - b.aabbmin.z);

							mesh.position.set((b.aabbmax.x + b.aabbmin.x) * 0.5,
									(b.aabbmax.y + b.aabbmin.y) * 0.5,
									(b.aabbmax.z + b.aabbmin.z) * 0.5);
						}
					}
				}

				bboxMeshCache.hideCached();
			};
			
			that.init = function() {
				var updatePhysics = _cannon.updatePhysics;

				_cannon.updatePhysics = function() {
					updatePhysics();
					that.update();
				}
			};

			return that;
		}
	};		

	var _three;

	return _cannon;
}