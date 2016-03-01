(function() {
	window.WebVRConfig = window.WebVRConfig || {};

	var extensionPresent = typeof(OculusMobileSDKHeadTracking) != 'undefined';

	if (extensionPresent && (!navigator.getVRDevices || WebVRConfig.FORCE_ENABLE_VR)) {
		// I love explicit names, but a simpler one makes my life easier
		var extension = OculusMobileSDKHeadTracking;

		// Inheritance 
		if (!Function.prototype.inherits) {
			Function.prototype.inherits = function (parent) {
			    this.prototype = new parent();
			    this.prototype.constructor = parent; 
			    return this;
			};
		}

		// The WebVR API implementation 

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
		HMDVRDevice.inherits(VRDevice);

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
		PositionSensorVRDevice.inherits(VRDevice);

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
		}
	}
})();
