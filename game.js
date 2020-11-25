let connection = null;
let messages = null;
let multiplayer = null;

function gameEntryPoint() {
    messages = document.querySelector('.chat-window');
    multiplayer = new GMP();
    multiplayer.onConnection((c) => {
        connection = c;
        addMessage('Chat started', true);
    }, onMessage).then();
    document.getElementById('startNewChat').onclick = () => startNewChat();
    document.getElementById('send').onclick = () => sendMessage();
}

function addMessage(text, local) {
    const msg = document.createElement('div');
    msg.innerText = text;
    msg.className = local ? 'msg local' : 'msg remote';
    messages.appendChild(msg);
}

function onMessage(data) {
    if (data === null) {
        addMessage('Chat ended', true)
        return;
    }
    addMessage(data, false);
}

async function startNewChat() {
    if (connection !== null) {
        connection.close();
    }
    const friends = new GFriends();
    const selected = await friends.showFriendsModal({allowSelect: true});
    if (!selected) {
        console.log('no selected, reload');
        window.location.reload();
        return;
    }
    const selectedId = (await friends.getFriends())[selected];
    console.log('Selected', selected, selectedId);

    const modal = new GModal();

    multiplayer.connect(selectedId, onMessage).then((c) => {
        if(c) {
            const overlay = document.querySelector('.initial-overlay');
            overlay.parentElement.removeChild(overlay);
            addMessage('Chat started', true);
            connection = c;
        } else {
            modal.alert('Chat request refused').then(() => window.location.reload());
        }
    });
}

function sendMessage() {
    const input = document.getElementById('input');
    connection.send(input.value);
    addMessage(input.value, true);
    input.value = '';
}


window.onload = gameEntryPoint;
