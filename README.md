# OculusMobileSDKHeadTrackingWebVR

This project aims to provide a [WebVR API](https://developer.mozilla.org/en-US/docs/Web/API/WebVR_API) shim implementation that uses the [OculusMobileSDKHeadTracking](https://github.com/judax/OculusMobileSDKHeadTracking) implementation of a native [Crosswalk extension](https://github.com/judax/OculusMobileSDKHeadTrackingXWalkViewExtension) or [Cordova plugin](https://github.com/judax/cordova-plugin-oculusmobilesdkheadtracking.git). 

## Folder Structure

* **js**: The main library code: OculusMobileSDKHeadTrackingWebVR.js a shim of the WebVR API that uses the OculusMobileSDKHeadTracking native binding through a crosswalk extension or a cordova plugin.
* **examples**: Some examples that use the library.

# How to use it

Crosswalk extensions and Cordova plugins are a great way to expose native functionalities through JavaScript for web application, but they fail to provide easy initialization of the native hooks in some scenarios. The WebVR API entry point is a function (`getVRDevices`) in the navigator object that should be available once the web app is loaded. Crosswalk extensions need to reference the corresponding extension object at least once to be loaded (lazy initialization) in JavaScript, a requirement that does not match well with a function in the navigator object. On the other hand, Cordova plugins need the `deviceready` event to be fired to be sure that the plugin is availabel in the JavaScript side. These behaviours make it difficult to automatically inject a WebVR API shim to make it available out of the box for any WebVR application. I am still trying to overcome these limitations, but for now, I have only been able to find a solution by providing the WebVR API shim through a JavaScript file that the developer needs to include in his/her web application. 

In order to include the WebVR shim API, please, include the following line before any mention to the WebVR API itself (inside the head tag for exmaple).

```
<script src="OculusMovileSDKHeadTrackingWebVR.js"></script>
```

## Configuration

The polyfill can be configured and debugged with various options. The following
are supported:

```
WebVRConfig = {
  // Forces the injection of the WebVR API using the native OculusMobileSDKHeadTracking extension object overriding any existing WebVR API.
  //FORCE_ENABLE_VR: true, // Default: false.
}
```

## Related Projects

* [OculusMobileSDKHeadTracking](https://github.com/judax/OculusMobileSDKHeadTracking): The Oculus Mobile SDK head tracking handling basic library.
* [OculusMobileSDKHeadTrackingCordovaPlugin](https://github.com/judax/cordova-plugin-oculusmobilesdkheadtracking.git): A Cordova plugin to expose the Oculus Mobile SDK Head Tracking in a JavaScript/browser based environment.
* [OculusMobileSDKHeadTrackingXWalkViewExtension](https://github.com/judax/OculusMobileSDKHeadTrackingXWalkViewExtension): A Crosswalk extension to expose the Oculus Mobile SDK Head Tracking in a JavaScript/browser based environment. 
