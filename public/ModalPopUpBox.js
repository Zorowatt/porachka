var modalSignup = document.querySelector(".modalSignup");
var modalLogin = document.querySelector(".modalLogin");
var modalAccount = document.querySelector(".modalAccount");

var triggerLogin = document.querySelector(".triggerLogin");
var triggerSignup = document.querySelector(".triggerSignup");
var triggerAccount = document.querySelector(".triggerAccount");

var closeButtonLogin = document.querySelector(".loginBtn");
var closeButtonSignup = document.querySelector(".signupBtn");


function toggleModalSignup() {
    modalSignup.classList.toggle("show-modal");
}
function toggleModalLogin() {
    modalLogin.classList.toggle("show-modal");
}
function toggleModalAccount() {
    modalAccount.classList.toggle("show-modal");
}
function windowOnClick(event) {
    if (event.target === modalLogin) {
        toggleModalLogin();
    }
    if (event.target === modalSignup) {
        toggleModalSignup();
    }
    if (event.target === modalAccount) {
        toggleModalAccount();
    }
}

triggerSignup.addEventListener("click", toggleModalSignup);
triggerLogin.addEventListener("click", toggleModalLogin);
triggerAccount.addEventListener("click", toggleModalAccount);

closeButtonLogin.addEventListener("click", toggleModalLogin);
closeButtonSignup.addEventListener("click", toggleModalSignup);


window.addEventListener("click", windowOnClick);