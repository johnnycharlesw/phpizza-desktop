let userDropdown;
let username = "NOT_UPDATEd123";
let usernameHtmlElement = document.getElementById('username');
let passedOver = false;


function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


// Read PHPizza's session token
async function updateSignedInUsername(){
    //console.log("Set-Cookie:",iframe.contentWindow.document.cookie);
    fetch('http://api.phpizza.localhost/GetUsername.php', {
        credentials: 'include'
    }).then(function (value){
        let responseObject = value.json();
        if (!passedOver) {
            iframe.contentWindow.postMessage({
                'phpsessid': getCookie('PHPSESSID')
            });
            passedOver=true;
        }
        username = responseObject.description;
    });
}


function toggleAccountMenu(){
    if (userDropdown) {
        let classList = userDropdown.classList;
        classList.toggle("open");
    } else {
        userDropdown = document.getElementById("user-dropdown");
        toggleAccountMenu();
    }
}



window.setInterval(function (params) {
    usernameHtmlElement.innerText = username;
}, 100);

