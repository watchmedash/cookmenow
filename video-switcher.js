function switchVideo(server, videoPlayerId, videoUrl) {
    var videoPlayer = document.getElementById(videoPlayerId);
    if (videoPlayer) {
        videoPlayer.src = videoUrl;
    }
}
