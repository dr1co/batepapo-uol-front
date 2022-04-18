let user

function getUser() {
    user = prompt("Qual é o seu nome de usuário?");
    const request = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', {
        name: user
    });
    request.then(setInterval(getChat, 3000));
    request.catch(errorTreatment);
    setInterval(function() {
        axios.post('https://mock-api.driven.com.br/api/v6/uol/status', {
            name: user
        })
    }, 5000)
}

function errorTreatment() {
        alert("Usuário já conectado:");
        getUser();
}

function getChat() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(loadChat);
}

function loadChat(element) {
    const chat = document.querySelector(".chat-log");
    chat.innerHTML = "";
    for(let i = 0 ; i < element.data.length ; i++ )
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
                console.log("esse tipo existe não man");
        }
    }
    chat.lastChild.scrollIntoView();
}

function sendMessage() {
    const message = document.querySelector("input");
    let receiver = "Todos"
    const request = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', {
        from: user,
        to: receiver,
        text: message.value,
        type: "message",
    });
    request.then(function() {
        getChat();
        message.value = "";
    });
    request.catch(function() {
        alert("Erro! Usuário não encontrado");
        window.location.reload()
    });
}

getUser();