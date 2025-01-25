import React , {useEffect, useState, useRef} from 'react';
import { Avatar, Typography } from '@mui/material';
import { Person, SmartToy } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Chat.css';
import { toast, ToastContainer } from 'react-toastify';

const Chat = ({chatMessages}) => {
    const lastMessageRef = useRef(null);

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

  return (
    <div className="chat-container">
      <div className="chat-card">
        <div className="chat-content" >
          {chatMessages.map((entry, index) => {
            const isUser = entry.participantType === 'user';
            const messageContainerClass = isUser ? 'message-container user' : 'message-container';
            const messageWrapperClass = isUser ? 'message-wrapper user' : 'message-wrapper';
            const messageBubbleClass = isUser ? 'message-bubble user' : 'message-bubble';
            const avatarClass = isUser ? 'avatar user' : 'avatar assistant';
            const isLastMessage = index === chatMessages.length - 1;
            return (
              <div key={entry.id} className={messageContainerClass}>
                <div className={messageWrapperClass} ref={isLastMessage ? lastMessageRef : null}>
                  <Avatar className={avatarClass}>
                    {isUser ? <Person /> : <SmartToy />}
                  </Avatar>

                  <div className="message-content">
                    <div className="message-header">
                      <Typography variant="body2" className="author-name">
                        {entry.author}
                      </Typography>
                    </div>

                    <div className={messageBubbleClass}>
                      <Typography className="bubble-content" variant="body2">
                        {entry.content}
                      </Typography>
                      {/* {entry.codeSnippet && (
                        <div className="code-block">
                          <SyntaxHighlighter
                            language={entry.language || 'text'}
                            style={materialDark}
                            customStyle={{
                              margin: 0,
                              borderRadius: '4px',
                            }}
                          >
                            {entry.codeSnippet}
                          </SyntaxHighlighter>
                        </div>
                      )} */}
                      {/* Handle multiple code snippets */}
                      {entry.codeSnippets?.map((snippet, index) => (
                        <div key={index} className="code-block">
                            <SyntaxHighlighter
                                language={snippet.language || 'text'}
                                style={materialDark}
                                customStyle={{
                                    margin: '8px 0',
                                    borderRadius: '4px',
                                }}
                            >
                                {snippet.code}
                            </SyntaxHighlighter>
                        </div>
                     ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Chat;
