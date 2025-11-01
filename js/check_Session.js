const checkSession = function () {
    let userSession = JSON.parse(localStorage.getItem('user_session'))
    if (userSession) {
        const now = new Date().getTime();

        if (now > userSession.expiry) {
            localStorage.removeItem('user_session');
            window.location.href = 'login.html'
        } else {
            console.log("phien con han")
        }


    } 
    else {
        window.location.href = './login.html'
    }
}
checkSession();