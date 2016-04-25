angular.module(
    'starter',
    [
        'ionic',
        'ngCordova'
    ]
).controller("ExampleController", function ($scope, $cordovaCapture) {
    $scope.resultSrc = '';
    $scope.bestCaptureMode = getBestCaptureMode();
    $scope.captureVideoWebRTC = captureVideoWebRTC;
    $scope.captureVideoNative = function() {
        captureVideoNative($scope, $cordovaCapture);
    };

});

var captureVideoNative = function($scope, $cordovaCapture) {
    var options = {
        limit: 1,
        duration: 15
    };
    $cordovaCapture.captureVideo(options).then(
        function (data) {
            var video = document.getElementById('videoResult');
            video.src = data[0].fullPath;
            video.load();
        },
        function (err) {
            // Handle capture video native error
            console.error(err);
        });
};

var captureVideoWebRTC = function() {
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    ;

    navigator.getUserMedia(
        {video: true},
        function(data) {
            // TODO: This is just streaming to the video tag, so have to actually
            // use the MediaCapture API to record to a blob and update the video src
            // when completed.

            var video = document.getElementById('videoResult');
            if(video.mozSrcObject !== undefined) {
                // Firefox
                video.mozSrcObject = data;
            } else {
                // Chrome
                video.src = (window.URL && window.URL.createObjectURL(data)) || data;
            }
            video.play();
        },
        function (err) {
            // Handle capture video native error
            console.error(err);
        }
    );

};

var isVideoSupportsStreamCapturing = function() {
    var videoDom = document.createElement('video');
    return 'captureStream' in videoDom ||
        'mozCaptureStream' in videoDom ||
        'webkitCaptureStream' in videoDom
    ;

};

var getBestCaptureMode = function () {
    if(ionic.Platform.isWebView()) {
        // Native is available
        return 'native';
    }
    if(isVideoSupportsStreamCapturing()) {
        // WebRTC Stream Capture is available
        return 'webRTC';
    }
    if(
        ionic.Platform.isAndroid() &&
            ionic.Platform.version() >= 3
    ) {
        // Media Capture API should be supported
        return 'mediaAPI';
    }

    // Nothing known is supported
    return 'input'
};