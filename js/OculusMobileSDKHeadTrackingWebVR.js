/**
Greetings to Boris Smus and his work on the WebVR polyfill from whom I have learnt a lot. https://github.com/borismus/webvr-polyfill/
Kudos to Brandon Jones and Vladimir Vukicevic for their work on the WebVR spec.
*/
(function() {
	function setupDeprecatedWebVRAPI() {

		console.log("setupDeprecatedWebVRAPI");
		
		// DOMPoint 
		DOMPoint = function() {
			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 0;
			return this;
		};

		// DOMRect 
		DOMRect = function() {
			this.x = 0;
			this.y = 0;
			this.width = 0;
			this.height = 0;
			this.top = 0;
			this.bottom = 0;
			this.left = 0;
			this.right = 0;
			return this;
		};

		// VRFieldOfView 
		VRFieldOfView = function () {
			this.upDegrees = 0;
			this.rightDegrees = 0;
			this.downDegrees = 0;
			this.leftDegrees = 0;
			return this;
		};

		// VREyeParameters 
		VREyeParameters = function() {
			this.minimumFieldOfView = new VRFieldOfView();
			this.maximumFieldOfView = this.minimumFieldOfView;
			this.recommendedFieldOfView = this.minimumFieldOfView;
			this.eyeTranslation = new DOMPoint();
			this.currentFieldOfView = this.minimumFieldOfView;
			this.renderRect = new DOMRect();
			return this;
		};

		// VRPositionState 
		VRPositionState = function() {
			this.timeStamp = 0;
			this.hasPosition = false;
			this.position = null; // The Oculus Mobile SDK does not povide position for now... maybe in the furture?
			this.linearVelocity = new DOMPoint();
			this.linearAcceleration = new DOMPoint();
			this.hasOrientation = true;
			this.orientation = new DOMPoint();
			this.angularVelocity = new DOMPoint();
			this.angularAcceleration = new DOMPoint();
			return this;
		};

		// VRDevice 
		VRDevice = function() {
			this.hardwareUnitId = 'OculusMobileSDKHeadTracking hwUnitId';
			this.deviceId = 'OculusMobileSDKHeadTracking deviceId';
			this.deviceName = 'OculusMobileSDKHeadTracking deviceName';
			return this;
		};

		// HMDVRDevice 
		HMDVRDevice = function() {
			var rigthEyeParameters = new VREyeParameters();
			var leftEyeParameters = new VREyeParameters();
			this.getEyeParameters = function(eye) {
				if (eye === 'right') {
					return rigthEyeParameters;
				}
				else if (eye === 'left') {
					return leftEyeParameters;
				}
			};
			this.setFieldOfView = function(leftFOV, rightFOV, zNear, zFar) {
			};
			return this;
		};
		HMDVRDevice.prototype = new VRDevice();
		HMDVRDevice.prototype.constructor = VRDevice;

		// PoistionSendorVRDevice 
		PositionSensorVRDevice = function() {
			state = new VRPositionState();
			this.getState = function() {
				var orientation = extension.getOrientation();
				state.orientation.x = orientation.x;
				state.orientation.y = orientation.y;
				state.orientation.z = orientation.z;
				state.orientation.w = orientation.w;
				return state;
			};
			this.getImmediateState = function() {
				return this.getState();
			};
			this.resetSensor = function() {
			};
			// Not in the official WebVR API
			this.zeroSensor = function() {
			};
			return this;
		};
		PositionSensorVRDevice.prototype = new VRDevice();
		PositionSensorVRDevice.prototype.constructor = VRDevice;

		// The VR devices
		var devices = null;
		// The promise resolvers for those promises created before the start event is received === devices are created.
		var resolvers = [];

		// Listen to the start event
		extension.addEventListener('start', function(event) {
			event.xFOV = 80;
			event.yFOV = 80;

			// Create the HMD VR device
			var hmdVRDevice = new HMDVRDevice();
			// Setup left/right eye parameters depending on the information from the event.
			// FOVs
			var rightEyeParameters = hmdVRDevice.getEyeParameters('right');
			var leftEyeParameters = hmdVRDevice.getEyeParameters('left');
			var upDegrees = event.yFOV / 2;
			var downDegrees = upDegrees;
			var rightDegrees = event.xFOV / 2;
			var leftDegrees = rightDegrees;
			rightEyeParameters.minimumFieldOfView.upDegrees = leftEyeParameters.minimumFieldOfView.upDegrees = upDegrees;
			rightEyeParameters.minimumFieldOfView.downDegrees = leftEyeParameters.minimumFieldOfView.downDegrees = downDegrees;
			rightEyeParameters.minimumFieldOfView.rightDegrees = leftEyeParameters.minimumFieldOfView.rightDegrees = rightDegrees;
			rightEyeParameters.minimumFieldOfView.leftDegrees = leftEyeParameters.minimumFieldOfView.leftDegrees = leftDegrees;
			// InterpupillaryDistance
			var eyeTranslation = Math.abs(event.interpupillaryDistance) / 2;
			rightEyeParameters.eyeTranslation.x = eyeTranslation;
			leftEyeParameters.eyeTranslation.x = -eyeTranslation;
			// Rendering rectangles based on the full screen size
			var fullScreenWidth = window.innerWidth * window.devicePixelRatio;
			var fullScreenHeight = window.innerHeight * window.devicePixelRatio;
			var eyeWidth = fullScreenWidth / 2;
			var eyeHeight = fullScreenHeight / 2;
			rightEyeParameters.renderRect.x = rightEyeParameters.renderRect.left = eyeWidth;
			rightEyeParameters.renderRect.right = rightEyeParameters.renderRect.x + eyeWidth;
			leftEyeParameters.renderRect.x = 0;
			leftEyeParameters.renderRect.right = eyeWidth;
			rightEyeParameters.renderRect.y = rightEyeParameters.renderRect.top = leftEyeParameters.renderRect.y = leftEyeParameters.renderRect.top = 0;
			rightEyeParameters.renderRect.width = leftEyeParameters.renderRect.width = eyeWidth;
			rightEyeParameters.renderRect.height = leftEyeParameters.renderRect.height = rightEyeParameters.renderRect.bottom = leftEyeParameters.renderRect.bottom = fullScreenHeight;
			// Create the position sensor VR device
			var positionSensorVRDevice = new PositionSensorVRDevice();					
			// Create the devices array and resolve the promise
			devices = [];
			devices.push(hmdVRDevice);
			devices.push(positionSensorVRDevice);
			// Notify the registered resolvers (if any)
			for (var i = 0; i < resolvers.length; i++) {
				resolvers[i](devices);
			}
			resolvers = [];
		});

		// Start the extension
		extension.start();

		navigator.getVRDevices = function() {
			return new Promise(
				function(resolve, reject) {
					// If we already have devices, reosolve the promise
					if (devices !== null) {
						resolve(devices);
					}
					// If there are no devices yet, register the resolver to notify them when the extension starts
					else {
						resolvers.push(resolve);
					}
				});
		};
	}

	var nextDisplayId = 1000;

	function setupWebVRAPI() {

		console.log("setupWebVRAPI");


		function notifyVRDisplayPresentChangeEvent(vrDisplay) {
			var event = new CustomEvent('vrdisplaypresentchange', {detail: {vrdisplay: self}});
			window.dispatchEvent(event);
			if (typeof(window.onvrdisplaypresentchange) === "function") {
				window.onvrdisplaypresentchange(event);
			}
		}

		VRDisplay = function() {
			var _layers = null;
			var _rigthEyeParameters = new VREyeParameters();
			var _leftEyeParameters = new VREyeParameters();
			var _pose = new VRPose();
			_pose.orientation = new Float32Array(4);

			this.isConnected = false;
			this.isPresenting = false;
			this.capabilities = new VRDisplayCapabilities();
			    this.capabilities.hasOrientation = true;
			    this.capabilities.canPresent = true;
			    this.capabilities.maxLayers = 1;
  			// this.stageParameters = null; // OculusMobileSDK (Gear VR) does not support room scale VR yet, this attribute is optional.
			this.getEyeParameters = function(eye) {
				if (eye === 'right') {
					return _rigthEyeParameters;
				}
				else if (eye === 'left') {
					return _leftEyeParameters;
				}
			};
			this.displayId = nextDisplayId++;
			this.displayName = 'OculusMobileSDKHeadTracking deviceName';
			this.getPose = function() {
				var orientation = extension.getOrientation();
				_pose.orientation[0] = orientation.x;
				_pose.orientation[1] = orientation.y;
				_pose.orientation[2] = orientation.z;
				_pose.orientation[3] = orientation.w;
				return _pose;
			};
			this.getImmediatePose = function() {
				return getPose();
			};
			this.resetPose = function() {
				// TODO: Make a call to the native extension to reset the pose.
			};
			this.depthNear = 0.01;
			this.depthFar = 10000.0;
			this.requestAnimationFrame = function(callback) {
				return window.requestAnimationFrame(callback);
			};
			this.cancelAnimationFrame = function(handle) {
				return window.cancelAnimationFrame(handle);
			};
			this.requestPresent = function(layers) {
				var self = this;
				return new Promise(function(resolve, reject) {
					self.isPresenting = true;
					notifyVRDisplayPresentChangeEvent(self);
					_layers = layers;
					resolve();
				});
			};
			this.exitPresent = function() {
				var self = this;
				return new Promise(function(resolve, reject) {
					self.isPresenting = false;
					resolve();
				});
			};
			this.getLayers = function() {
				return _layers;
			};
			this.submitFrame = function(pose) {
				// TODO: Learn fom the WebVR Polyfill how to make the barrel distortion.
			};
			return this;
		};

		VRLayer = function() {
			this.source = null;
			this.leftBounds = [];
			this.rightBounds = [];
			return this;
		};

		VRDisplayCapabilities = function() {
			this.hasPosition = false;
			this.hasOrientation = false;
			this.hasExternalDisplay = false;
			this.canPresent = false;
			this.maxLayers = 0;
			return this;
		};

		VREye = {
			left: "left",
			right: "right"
		};

		VRFieldOfView = function() {
			this.upDegrees = 0;
			this.rightDegrees = 0;
			this.downDegrees = 0;
			this.leftDegrees = 0;
			return this;
		};

		VRPose = function() {
			this.timeStamp = 0;
			this.position = null;
			this.linearVelocity = null;
			this.linearAcceleration = null;
			this.orientation = null;
			this.angularVelocity = null;
			this.angularAcceleration = null;
			return this;
		};

		VREyeParameters = function() {
			this.offset = null;
			this.fieldOfView = null;
			this.renderWidth = 0;
			this.renderHeight = 0;
			return this;
		};

		VRStageParameters = function() {
			this.sittingToStandingTransform = null;
			this.sizeX = 0;
			this.sizeZ = 0;
			return this;
		};

		// The VR displayes
		var displays = null;
		// The promise resolvers for those promises created before the start event is received === devices are created.
		var resolvers = [];

		// Listen to the start event
		extension.addEventListener('start', function(event) {
			event.xFOV = 80;
			event.yFOV = 80;

			// Create the VR display
			var vrDisplay = new VRDisplay();
			// Setup left/right eye parameters depending on the information from the event.
			// FOVs
			var rightEyeParameters = vrDisplay.getEyeParameters('right');
			var leftEyeParameters = vrDisplay.getEyeParameters('left');
			var upDegrees = event.yFOV / 2;
			var downDegrees = upDegrees;
			var rightDegrees = event.xFOV / 2;
			var leftDegrees = rightDegrees;
			rightEyeParameters.fieldOfView = new VRFieldOfView();
			leftEyeParameters.fieldOfView = new VRFieldOfView();
			rightEyeParameters.fieldOfView.upDegrees = leftEyeParameters.fieldOfView.upDegrees = upDegrees;
			rightEyeParameters.fieldOfView.downDegrees = leftEyeParameters.fieldOfView.downDegrees = downDegrees;
			rightEyeParameters.fieldOfView.rightDegrees = leftEyeParameters.fieldOfView.rightDegrees = rightDegrees;
			rightEyeParameters.fieldOfView.leftDegrees = leftEyeParameters.fieldOfView.leftDegrees = leftDegrees;
			// InterpupillaryDistance
			rightEyeParameters.offset = new Float32Array(3);
			leftEyeParameters.offset = new Float32Array(3);
			var offset = Math.abs(event.interpupillaryDistance) / 2;
			rightEyeParameters.offset[0] = offset;
			leftEyeParameters.offset[0] = -offset;
			// Rendering width and height based on the full screen size
			var fullScreenWidth = window.innerWidth * window.devicePixelRatio;
			var fullScreenHeight = window.innerHeight * window.devicePixelRatio;
			var eyeWidth = fullScreenWidth / 2;
			// var eyeHeight = fullScreenHeight / 2;
			rightEyeParameters.renderWidth = leftEyeParameters.renderWidth = eyeWidth;
			rightEyeParameters.renderHeight = leftEyeParameters.renderHeight = fullScreenHeight;
			// Create the displays array and resolve the promise
			displays = [];
			displays.push(vrDisplay);
			// Notify the registered resolvers (if any)
			for (var i = 0; i < resolvers.length; i++) {
				resolvers[i](displays);
			}
			resolvers = [];
		});

		// Start the extension
		extension.start();

		navigator.getVRDisplays = function() {
			return new Promise(
				function(resolve, reject) {
					// If we already have displays, reosolve the promise
					if (displays !== null) {
						resolve(displays);
					}
					// If there are no displays yet, register the resolver to notify them when the extension starts
					else {
						resolvers.push(resolve);
					}
				});
		};

		// TODO: reimplement window.addEventListener for the 3 events that are supported in the WebVR spec
		// onvrdisplayconnected
		// onvrdisplaydisconnected
		// onvrdisplaypresentchange
	}

	window.WebVRConfig = window.WebVRConfig || {};

	var extensionPresent = typeof(OculusMobileSDKHeadTracking) != 'undefined';

	if (extensionPresent && ((!navigator.getVRDevices && !navigator.getVRDisplays) || WebVRConfig.FORCE_ENABLE_VR)) {
		// I love explicit names, but a simpler one makes my life easier
		var extension = OculusMobileSDKHeadTracking;

		// The WebVR API implementation 

		if (WebVRConfig.ENABLE_DEPRECATED_API) {
			setupDeprecatedWebVRAPI();
		}
		else {
			setupWebVRAPI();
		}

	}
})();
