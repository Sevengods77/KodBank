import React, { useState, useEffect, useRef } from 'react';

function App() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            if (data.message) {
                setMessages(prev => [...prev, data.message]);
            } else {
                throw new Error('No message in response');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'ai', content: 'I apologize, but I am having trouble connecting to the Kodask banking servers. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="kodask-logo">
                        <span style={{ color: 'var(--gold-accent)' }}>🏦</span> Kodask
                    </div>
                </div>
                <button className="new-chat-btn" onClick={() => setMessages([])}>
                    <span>+</span> New Chat
                </button>
            </div>

            <div className="chat-area">
                <div className="chat-header">
                    Kodask Banking AI
                </div>

                <div className="messages-container">
                    {messages.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏦</div>
                            <h2>How can I assist your finances today?</h2>
                            <p style={{ marginTop: '0.5rem' }}>Kodask: Secure, Sophisticated, Professional.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`message-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                <div className="message-content">
                                    <div className={`avatar ${msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                                        {msg.role === 'user' ? 'U' : 'K'}
                                    </div>
                                    <div className="text-content">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-container">
                    <div className="input-wrapper">
                        <textarea
                            placeholder="Type a message..."
                            rows="1"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="send-btn"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? '...' : '↑'}
                        </button>
                    </div>
                </div>
                <div className="footer-note">
                    Kodask AI may provide information for illustrative purposes. Always verify with actual banking records.
                </div>
            </div>
        </>
    );
}

export default App;
