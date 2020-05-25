document.addEventListener('DOMContentLoaded', () => {
    //Make enter key submit

    let msg = document.querySelector("#user_message");
    msg.addEventListener('keyup', event => {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.querySelector("#send_message").click();
        }
    })

});


function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("main").style.marginLeft = "300px";
    document.getElementById("main-nav").style.marginLeft = "300px";

}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "10%";
    document.getElementById("main-nav").style.marginLeft = "0px";

}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
