document.addEventListener('DOMContentLoaded', () => {
    //Make enter key submit

    let msg = document.querySelector("#add-new-channel");
    msg.addEventListener('keyup', event => {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.querySelector("#btn-add-channel").click();
        }
    });

    let channel = document.querySelector("#user_message");
    channel.addEventListener('keyup', event => {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.querySelector("#send_message").click();
        }
    });

    // By default, send_message button is disabled
    document.querySelector('#send_message').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#user_message').onkeyup = () => {
        if (document.querySelector('#user_message').value.length > 0)
            document.querySelector('#send_message').disabled = false;
        else
            document.querySelector('#send_message').disabled = true;
    };

    // By default, create_channel button is disabled
    document.querySelector('#btn-add-channel').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#add-new-channel').onkeyup = () => {
        if (document.querySelector('#add-new-channel').value.length > 0)
            document.querySelector('#btn-add-channel').disabled = false;
        else
            document.querySelector('#btn-add-channel').disabled = true;
    };

});


function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("main").style.marginLeft = "300px";
    document.getElementById("main-nav").style.marginLeft = "300px";

}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "10%";
    document.getElementById("main-nav").style.marginLeft = "0px";

}

