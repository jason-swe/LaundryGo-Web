import { useState } from 'react'
import './ChatButton.css'
import { MessageOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons'
import { useTranslation } from '../shared/lib/i18n'

function ChatButton() {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { id: 1, sender: 'support', textKey: 'chat.initialMessage', time: '10:30 AM' }
    ])
    const [inputValue, setInputValue] = useState('')

    const handleSend = () => {
        if (!inputValue.trim()) return

        const newMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }

        setMessages([...messages, newMessage])
        setInputValue('')

        // Simulate response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    sender: 'support',
                    textKey: 'chat.autoReply',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
            ])
        }, 1000)
    }

    return (
        <>
            <button
                className={`chat-button ${isOpen ? 'chat-button-active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t('chat.buttonLabel')}
            >
                <MessageOutlined className="chat-button-icon" />
                <span className="chat-button-label">{t('chat.buttonLabel')}</span>
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-window-header">
                        <div className="chat-window-header-info">
                            <div className="chat-window-title">{t('chat.liveChat')}</div>
                            <div className="chat-window-status">● {t('chat.online')}</div>
                        </div>
                        <button
                            className="chat-window-close"
                            onClick={() => setIsOpen(false)}
                            aria-label={t('chat.close')}
                        >
                            <CloseOutlined />
                        </button>
                    </div>

                    <div className="chat-window-messages">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chat-message chat-message-${message.sender}`}
                            >
                                <div className="chat-message-bubble">
                                    <div className="chat-message-text">{message.textKey ? t(message.textKey) : message.text}</div>
                                    <div className="chat-message-time">{message.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="chat-window-input-area">
                        <input
                            type="text"
                            className="chat-window-input"
                            placeholder={t('chat.typeMessage')}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="chat-window-send" onClick={handleSend} aria-label={t('chat.send')}>
                            <SendOutlined />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default ChatButton
