angular.module(
    'starter',
    [
        'ionic',
        'ngCordova'
    ]
).controller("ExampleController", function ($scope, $cordovaCapture) {
    $scope.pageState = pageState;
    $scope.bestCaptureMode = getBestCaptureMode();
    $scope.captureVideoWebRTC = captureVideoWebRTC;
    $scope.stopCaptureVideoWebRTC = stopCaptureVideoWebRTC;

    $scope.captureVideoNative = function () {
        captureVideoNative($scope, $cordovaCapture);
    };

});

var pageState = {
    isRecording: false,
    stream: undefined,
    recorder: undefined,
    chunks: undefined
};

var captureVideoNative = function ($scope, $cordovaCapture) {
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

var stopCaptureVideoWebRTC = function () {
    pageState.isRecording = false;

    if (pageState.recorder && pageState.chunks) {
        pageState.recorder.onstop = function () {
            var blob = new Blob(pageState.chunks, { type: 'video/mp4'});

            pageState.chunks = [];

            var video = document.getElementById('videoResult');
            if(video.mozSrcObject !== undefined) {
                video.mozSrcObject = undefined;
            }
            video.src = window.URL.createObjectURL(blob);
        };
        pageState.recorder.stop();
    }

    if (pageState.stream) {
        // This will be deprecated eventually
        // but the alternative may cause crashes on some browser so far
        if (pageState.stream.stop) {
            pageState.stream.stop();
        } else {
            pageState.stream.getTracks().forEach(function (track) {
                track.stop();
            })
        }
    }
};

var captureVideoWebRTC = function () {
    pageState.isRecording = true;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    ;

    navigator.getUserMedia(
        {video: true},
        function (stream) {
            pageState.stream = stream;

            var video = document.getElementById('videoResult');
            if (video.mozSrcObject !== undefined) {
                // Firefox
                video.mozSrcObject = stream;
                pageState.chunks = [];
                pageState.recorder = new MediaRecorder(stream, {mimeType: 'video/mp4'});
                pageState.recorder.ondataavailable = handleDataAvailable;
                pageState.recorder.start();
            } else {
                // Chrome
                video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
            }
            video.load();
            video.play();
        },
        function (err) {
            // Handle capture video native error
            console.error(err);
        }
    );

};

var isVideoSupportsStreamCapturing = function () {
    var videoDom = document.createElement('video');
    return 'captureStream' in videoDom ||
        'mozCaptureStream' in videoDom ||
        'webkitCaptureStream' in videoDom
        ;

};

var getBestCaptureMode = function () {
    if (ionic.Platform.isWebView()) {
        // Native is available
        return 'native';
    }
    if (isVideoSupportsStreamCapturing()) {
        // WebRTC Stream Capture is available
        return 'webRTC';
    }
    if (
        ionic.Platform.isAndroid() &&
        ionic.Platform.version() >= 3
    ) {
        // Media Capture API should be supported
        return 'mediaAPI';
    }

    // Nothing known is supported
    return 'input'
};

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        pageState.chunks.push(event.data);
    }
}