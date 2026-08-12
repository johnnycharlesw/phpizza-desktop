let iframe = document.getElementById('iframe');
let dialup_sfx = document.getElementById('dialup_sfx');
let fullscreen = false;
let dialed = false;
const POST_DIAL_TIMESTAMP = 6.804707;


console.log(iframe);

iframe.addEventListener('load', function (params) {
    if (!(dialup_sfx.paused)) {
        dialup_sfx.pause();
        dialup_sfx.currentTime = POST_DIAL_TIMESTAMP;
    }
    updateSignedInUsername();
})

function navigateTo(url) {
    iframe.src=url;
    playDialUpSfx();
}

function goHome(){
  navigateTo('http://phpizza.localhost');
}

function goToAdminPanel() {
  navigateTo('http://phpizza.localhost/AdminPanel.php');
}

function goToSpecialPageList() {
  navigateTo('http://phpizza.localhost/SpecialPages.php');
}

function toggleFullscreen(){
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    document.body.parentElement.requestFullscreen();
  }
}

function switchUser() {
    navigateTo('http://phpizza.localhost/SwitchUser.php');
}

function _closeBrowser() {
  window.close();
}

function closeBrowser() {
  if (window.phpizzaDesktop?.incognito) {
    navigateTo('http://phpizza.localhost/DestroySessionToken.php');
    iframe.addEventListener('load', function (){
        _closeBrowser();
    });
  } else {
    _closeBrowser();
  }
}


goHome();

 function playDialUpSfx() {
    dialup_sfx.play();
}

iframe.addEventListener('loadstart', playDialUpSfx);

iframe.addEventListener('waiting', playDialUpSfx);

setInterval(() => {
    if (dialup_sfx.currentTime > POST_DIAL_TIMESTAMP) {
        dialed = true;
    }

    if (dialed && dialup_sfx.currentTime < POST_DIAL_TIMESTAMP) {
        dialup_sfx.currentTime = POST_DIAL_TIMESTAMP;
    }
}, 10);