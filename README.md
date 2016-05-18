# OculusMobileSDKHeadTrackingWebVR

This project aims to provide a [WebVR API 1.0](https://mozvr.com/webvr-spec/) (and the [deprecated API version](https://developer.mozilla.org/en-US/docs/Web/API/WebVR_API)) shim/polyfill implementation that uses the [OculusMobileSDKHeadTracking](https://github.com/judax/OculusMobileSDKHeadTracking) implementation of a native [Crosswalk extension](https://github.com/judax/OculusMobileSDKHeadTrackingXWalkViewExtension) or [Cordova plugin](https://github.com/judax/cordova-plugin-oculusmobilesdkheadtracking.git). 

## Folder Structure

* **js**: The main library code: OculusMobileSDKHeadTrackingWebVR.js a shim of the WebVR API that uses the OculusMobileSDKHeadTracking native binding through a crosswalk extension or a cordova plugin.
* **examples**: Some examples that use the library.

# How to use it

The [OculusMobileSDKHeadTrackingXWalkViewExtension](https://github.com/judax/OculusMobileSDKHeadTrackingXWalkViewExtension) project includes [a test](https://github.com/judax/OculusMobileSDKHeadTrackingXWalkViewExtension/tree/master/test) that automatically injects this file when a web page is being loaded. You can read on [how to use the libray/test](https://github.com/judax/OculusMobileSDKHeadTrackingXWalkViewExtension#how-to-use-the-library).

If you would like to create your own app, you could choose one of the following options:

1. Inject the JS code yourself (similar to [the test](https://github.com/judax/OculusMobileSDKHeadTrackingXWalkViewExtension/tree/master/test))
2. Include the JS file in your web app before any other script.

```
<script src="OculusMovileSDKHeadTrackingWebVR.js"></script>
```

The polyfill does not override any pre-existing WebVR API by default. Check the [Configuration](https://github.com/judax/OculusMobileSDKHeadTrackingWebVR#configuration) section down below.

## Configuration

The polyfill can be configured and debugged with various options. The following are supported:

```
WebVRConfig = {
  // This polyfill is active only if the WebVR API is not already present by default. This flag overrides any pre-existing WebVR API and forces the injection of the WebVR API using the native OculusMobileSDKHeadTracking extension object.
  FORCE_ENABLE_VR: true, // Default: false.
  // Enabled the deprecated WebVR API that still some code out there might need to use.
  ENABLE_DEPRECATED_API: true, // Default: false.
}
```

## Future work, improvements and random ideas

* Add barrel distortion to the WebVR polyfill.

## Related Projects

* [OculusMobileSDKHeadTracking](https://github.com/judax/OculusMobileSDKHeadTracking): The Oculus Mobile SDK head tracking handling basic library.
* [OculusMobileSDKHeadTrackingCordovaPlugin](https://github.com/judax/cordova-plugin-oculusmobilesdkheadtracking.git): A Cordova plugin to expose the Oculus Mobile SDK Head Tracking in a JavaScript/browser based environment.
* [OculusMobileSDKHeadTrackingXWalkViewExtension](https://github.com/judax/OculusMobileSDKHeadTrackingXWalkViewExtension): A Crosswalk extension to expose the Oculus Mobile SDK Head Tracking in a JavaScript/browser based environment. 
