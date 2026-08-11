let iframe = document.getElementById('iframe');
let dialup_sfx = document.getElementById('dialup_sfx');
let fullscreen = false;


iframe.addEventListener('load', function (params) {
    if (!(dialup_sfx.paused)) {
        dialup_sfx.pause();
        dialup_sfx.fastSeek(0);
    }
})

function navigateTo(url) {
    iframe.src=url;
    dialup_sfx.play();
}

function goHome(){
  navigateTo('http://localhost');
}

function goToAdminPanel() {
  navigateTo('http://localhost/AdminPanel.php');
}

function toggleFullscreen(){
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    document.body.parentElement.requestFullscreen();
  }
}

goHome();

iframe.addEventListener('loadstart', function (params) {
    dialup_sfx.play();
})