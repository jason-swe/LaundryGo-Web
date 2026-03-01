import './ChatButton.css'
import { useState } from 'react'

function ChatButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button className="chat-button" onClick={() => setIsOpen(!isOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="currentColor" />
                </svg>
                <span>Live Chat</span>
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor" />
                            </svg>
                            <span>Hỗ trợ trực tuyến</span>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>

                    <div className="chat-body">
                        <div className="chat-message received">
                            <div className="message-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor" />
                                </svg>
                            </div>
                            <div className="message-content">
                                <div className="message-text">
                                    Xin chào! Tôi có thể giúp gì cho bạn?
                                </div>
                                <div className="message-time">10:30 AM</div>
                            </div>
                        </div>

                        <div className="chat-message sent">
                            <div className="message-content">
                                <div className="message-text">
                                    Tôi cần hỗ trợ về máy giặt
                                </div>
                                <div className="message-time">10:32 AM</div>
                            </div>
                        </div>

                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>

                    <div className="chat-footer">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Nhập tin nhắn..."
                        />
                        <button className="send-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default ChatButton
