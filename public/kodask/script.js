const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages-container');
const emptyState = document.getElementById('empty-state');
const newChatBtn = document.getElementById('new-chat-btn');

let messages = [];
let isLoading = false;

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createMessageElement(role, content) {
    const row = document.createElement('div');
    row.className = `message-row ${role === 'user' ? 'user' : 'ai'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const avatar = document.createElement('div');
    avatar.className = `avatar ${role === 'user' ? 'user-avatar' : 'ai-avatar'}`;
    avatar.textContent = role === 'user' ? 'U' : 'K';

    const textContent = document.createElement('div');
    textContent.className = 'text-content';
    textContent.textContent = content;

    contentDiv.appendChild(avatar);
    contentDiv.appendChild(textContent);
    row.appendChild(contentDiv);

    return row;
}

async function handleSend() {
    const input = chatInput.value.trim();
    if (!input || isLoading) return;

    // Hide empty state on first message
    if (messages.length === 0) {
        emptyState.style.display = 'none';
    }

    const userMessage = { role: 'user', content: input };
    messages.push(userMessage);

    messagesContainer.appendChild(createMessageElement('user', input));
    chatInput.value = '';
    chatInput.style.height = 'auto';
    setIsLoading(true);
    scrollToBottom();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages
            }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        if (data.message) {
            messages.push(data.message);
            messagesContainer.appendChild(createMessageElement('ai', data.message.content));
        } else {
            throw new Error('No message in response');
        }
    } catch (error) {
        console.error('Error:', error);
        const errorContent = 'I apologize, but I am having trouble connecting to the Kodask banking servers. Please try again later.';
        messagesContainer.appendChild(createMessageElement('ai', errorContent));
    } finally {
        setIsLoading(false);
        scrollToBottom();
    }
}

function setIsLoading(loading) {
    isLoading = loading;
    sendBtn.disabled = loading;
    sendBtn.textContent = loading ? '...' : '↑';
    chatInput.disabled = loading;
}

chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
});

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

sendBtn.addEventListener('click', handleSend);

newChatBtn.addEventListener('click', () => {
    messages = [];
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(emptyState);
    emptyState.style.display = 'flex';
    chatInput.value = '';
    chatInput.style.height = 'auto';
});
