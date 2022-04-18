let user;
let receiver = "Todos"
let messageType = "message"
let messageButton = document.querySelector(".message-text").querySelector("input")
let sendUserButton = document.querySelector(".login-screen").querySelector("input")

function getUser() {
    user = document.querySelector(".login-screen").querySelector("input").value;
    if(user === "")
    {
        alert("Nome de usuário vazio: tente novamente");
        return;
    }
    const request = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', {
        name: user
    });
    request.then(function() {
        document.querySelector(".login-screen").style.display = "none";
    });
    request.then(getChat);
    request.then(setInterval(getChat, 3000));
    request.then(getParticipants);
    request.then(setInterval(getParticipants, 10000));
    request.then(setInterval(function() {
        axios.post('https://mock-api.driven.com.br/api/v6/uol/status', {
            name: user
        })
    }, 5000));
    request.catch(function() {
        alert("Usuário já conectado:");
        sendUserButton.addEventListener("keyup", clickUserButton);
    });
}

function getChat() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(loadChat);
}

function loadChat(element) {
    const chat = document.querySelector(".chat-log");
    chat.innerHTML = "";
    for(let i = 0 ; i < element.data.length ; i++)
    {
        switch(element.data[i].type)
        {
            case("status"):
                chat.innerHTML += `<li class="message status"> 
                    <p> <strong class="timestamp"> (${element.data[i].time}) </strong> <strong> ${element.data[i].from} </strong> ${element.data[i].text} </p>
                </li>`;
                break;
            case("message"):
                chat.innerHTML += `<li class="message regular">
                    <p> <strong class="timestamp"> (${element.data[i].time}) </strong> <strong> ${element.data[i].from} </strong> para <strong> ${element.data[i].to}</strong>: ${element.data[i].text} </p>
                </li>`;
                break;
            case("private_message"):
                if(element.data[i].to === user || element.data[i].from === user)
                {
                    chat.innerHTML += `<li class="message reserved">
                        <p> <strong class="timestamp"> (${element.data[i].time}) </strong> <strong> ${element.data[i].from} </strong> reservadamente para <strong> ${element.data[i].to}</strong>: ${element.data[i].text} </p>
                    </li>`;
                }
                break;
            default:
                console.log(`Esse tipo da mensagem ${i} não existe`);
        }
    }
    chat.lastChild.scrollIntoView();
}

function getParticipants() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    promise.then(loadParticipants);
}

function loadParticipants(element) {
    const participants = document.querySelector(".users-list");
    participants.innerHTML = `<li class="user selected" data-identifier="participant" onclick="selectUser(this)">
        <ion-icon class="user-icon" name="people"></ion-icon>
        <p>Todos</p>
        <ion-icon class="check-icon show" name="checkmark-sharp"></ion-icon>
    </li>`;
    for(let i = 0 ; i < element.data.length ; i++)
    {
        participants.innerHTML += `<li class="user" onclick="selectUser(this)">
            <ion-icon class="user-icon" name="person-circle"></ion-icon>
            <p>${element.data[i].name}</p>
            <ion-icon class="check-icon" name="checkmark-sharp"></ion-icon>
        </li>`
    }
}

function toggleSidebar() {
    const background = document.querySelector(".background");
    const sidebar = document.querySelector(".sidebar");
    background.classList.toggle("show");
    sidebar.classList.toggle("show");
}

function selectUser(element) {
    const messageBox = document.querySelector(".message-text");
    const selected = document.querySelector(".users-list").querySelector(".selected");
    const checkSelected = document.querySelector(".users-list").querySelector(".show");
    if(selected !== null)
    {
        selected.classList.remove("selected");
        checkSelected.classList.remove("show");
    }
    element.classList.add("selected");
    element.querySelector(".check-icon").classList.add("show");
    receiver = element.querySelector("p").innerHTML;
    if(messageType === "message")
    {
        messageBox.innerHTML = `<input type="text" placeholder="Escreva aqui...">`;
    }
    if(messageType === "private_message")
    {
        messageBox.innerHTML = `<input type="text" placeholder="Escreva aqui...">
        <p> Enviando para ${receiver} (reservadamente) </p>`;
    }
}

function selectType(element) {
    const messageBox = document.querySelector(".message-text");
    const selected = document.querySelector(".type-list").querySelector(".selected");
    const checkSelected = document.querySelector(".type-list").querySelector(".show");
    if(selected !== null)
    {
        selected.classList.remove("selected");
        checkSelected.classList.remove("show");
    }
    element.classList.add("selected");
    element.querySelector(".check-icon").classList.add("show");
    if(element.querySelector("p").innerHTML === "Público")
    {
        messageBox.innerHTML = `<input type="text" placeholder="Escreva aqui...">`;
        messageType = "message";
    }
    if(element.querySelector("p").innerHTML === "Reservadamente")
    {
        messageBox.innerHTML = `<input type="text" placeholder="Escreva aqui...">
        <p> Enviando para ${receiver} (reservadamente) </p>`;
        messageType = "private_message";
    }
}

function sendMessage() {
    const message = document.querySelector(".message-text").querySelector("input");
    if(message.value === "") return;
    const request = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', {
        from: user,
        to: receiver,
        text: message.value,
        type: messageType,
    });
    request.then(function() {
        getChat();
        message.value = "";
    });
    request.catch(function() {
        alert("Erro! Usuário não encontrado");
        window.location.reload();
    });
}

function clickMessageButton(event) {
    if (event.keyCode === 13)
    {
        event.preventDefault();
        document.querySelector(".message-box").querySelector("button").click();
    }
}

function clickUserButton(event) {
    if (event.keyCode === 13)
    {
        event.preventDefault();
        document.querySelector(".login-screen").querySelector("button").click();
    }
}

sendUserButton.addEventListener("keyup", clickUserButton);
messageButton.addEventListener("keyup", clickMessageButton);