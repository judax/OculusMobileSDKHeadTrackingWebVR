(function() {
	var extensionPresent = typeof(OculusMobileSDKHeadTracking) != 'undefined';
	if (extensionPresent && !navigator.getVRDevices) {
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
			this.maximumFieldOfView = new VRFieldOfView();
			this.recommendedFieldOfView = new VRFieldOfView();
			this.eyeTranslation = new DOMPoint();
			this.currentFieldOfView = new VRFieldOfView();
			this.renderRect = new DOMRect();
			return this;
		};

		// VRPositionState 
		VRPositionState = function() {
			this.timeStamp = 0;
			this.hasPosition = false;
			this.position = new DOMPoint();
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
			this.hardwareUnitId = '';
			this.deviceId = '';
			this.deviceName = '';
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
			return this;
		};
		PositionSensorVRDevice.inherits(VRDevice);

		var devices = [
			new HMDVRDevice(),
			new PositionSensorVRDevice()
		];
		navigator.getVRDevices = function() {
			return new Promise(
				function(resolve, reject) {
					resolve(devices);
				});
		}
	}
})();
