Camera capture Example For Ionic
================================

This is a sample project trying to record a video using the user's camera
while trying to find the best method to do so.

Here are the methods checked in order of precedence:

- **Native API** for bundled apps
- **WebRTC** for browser supporting WebRTC Stream Capture
- **Media API** for mobile browser supporting input method with `capture` attribute (Mobile browser on Android > 3.0)
- **File Input** as a default

Usage
=====

    npm install
    bower install

Then you need to add the platforms you want, for example:
`ionic platform android`