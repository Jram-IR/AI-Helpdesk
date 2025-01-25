import React , {useEffect, useState, useRef} from 'react';
import { Avatar, Typography } from '@mui/material';
import { Person, SmartToy, AdminPanelSettings} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Thread.css';
import { jwtDecode } from 'jwt-decode';

// Sample conversation data
const threadData = [
  {
    id: 1,
    author: "AI Assistant",
    content: "Hello! How can I help you today?",
    createdAt: "2024-12-24T10:00:00",
    participantType: "assistant"
  },
  {
    id: 2,
    author: "John Doe",
    content: "Can you explain how to use async/await in JavaScript?",
    createdAt: "2024-12-24T10:01:00",
    participantType: "user"
  },
  {
    id: 3,
    author: "AI Assistant",
    content: "I'll explain async/await with a simple example:",
    createdAt: "2024-12-24T10:02:00",
    participantType: "assistant",
    codeSnippet: `async function fetchUserData() {
  try {
    const response = await fetch('https://api.example.com/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`
  },  {
    id: 1,
    author: "AI Assistant",
    content: "Hello! How can I help you today?",
    createdAt: "2024-12-24T10:00:00",
    participantType: "assistant"
  },
  {
    id: 2,
    author: "John Doe",
    content: "Can you explain how to use async/await in JavaScript?",
    createdAt: "2024-12-24T10:01:00",
    participantType: "user"
  },
  {
    id: 3,
    author: "AI Assistant",
    content: "The challenge is using the right file encoding.  The JVM's default encoding (from the `file.encoding` property), derived from the system's locale, is unreliable for reproducible builds because it varies between machines and developers.  Using the default encoding in `FileReader` and `FileWriter` should be avoided because it can lead to corrupted text files if developers have different default encodings (e.g., UTF-8 vs. ISO-8859-1).  To process XML files correctly, use `ReaderFactory.newXmlReader()` and `WriterFactory.newXmlWriter()` from Plexus Utilities.",
    createdAt: "2024-12-24T10:02:00",
    participantType: "assistant",
    codeSnippet: `async function fetchUserData() {
  try {
    const response = await fetch('https://api.example.com/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
  {
    const response = await fetch('https://api.example.com/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
  {
    const response = await fetch('https://api.example.com/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
  {
    const response = await fetch('https://api.example.com/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`
  }
];

const Thread = ({threadData}) => {

  const lastMessageRef = useRef(null);
  const adminView = 'a';
  const userView = 'u';
  const [viewType, setViewType] = useState('')
  useEffect(() => {
      if (lastMessageRef.current) {
          lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      const token = localStorage.getItem('token')
      const jwt = jwtDecode(token)
      if (jwt.desig === 'user'){
        setViewType(userView)
      }else{
        setViewType(adminView)
      }
  }, [threadData]);
  return (
    <div className="thread-container">
      <div className="thread-card">
        <div className="thread-content">
          {threadData.map((entry,index) => {
            const isUser = entry.participantType === 'user';
            const isAgent = entry.participantType === 'agent';

            const messageContainerClass = isUser
              ? 'message-container user '+viewType
              : isAgent 
              ? 'message-container agent '+viewType
              : 'message-container ';

            const messageWrapperClass = isUser
              ? 'message-wrapper user '+viewType
              : isAgent 
              ? 'message-wrapper agent '+viewType
              : 'message-wrapper ';

            const messageBubbleClass = isUser
              ? 'message-bubble user '+viewType
              : isAgent
              ? 'message-bubble agent '+viewType
              : 'message-bubble ';

            const avatarClass = isUser
              ? 'avatar user'
              : isAgent
              ? 'avatar agent'
              : 'avatar assistant';

            const avatarIcon = isUser
              ? <Person />
              : isAgent
              ? <AdminPanelSettings />
              : <SmartToy />;
              const isLastMessage = index === threadData.length - 1;

            return (
              <div key={entry.id} className={messageContainerClass} ref={isLastMessage ? lastMessageRef : null}>
                <div className={messageWrapperClass}>
                  <Avatar className={avatarClass}>
                    {avatarIcon}
                  </Avatar>
                  
                  <div className="message-content">
                    <div className="message-header">
                      <Typography variant="body2" className="author-name">
                        {entry.author}
                      </Typography>
                    </div>

                    <div className={messageBubbleClass}>
                      <Typography className='bubble-content'variant="body2">
                        {entry.content}
                      </Typography>
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
    </div>
  );
};

export default Thread;