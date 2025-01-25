import React, { useState } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress
import './InputBox.css';

const InputBox = ({ handleSentMessage, isLoading, showEscalate, handleEscalation}) => {
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim() !== '') {
      handleSentMessage(message);
      setMessage('');
    }
  };

  const handleEscalate = (e) => {
    handleEscalation(message)
  };

  return (
    <div className="input-container">
      <div className="textarea-wrapper">
        <textarea
          value={message}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="input-box"
        />
        <button onClick={handleSend} className="send-button" disabled={isLoading}>
          {isLoading ? (
            <CircularProgress size={24} className="progress-indicator" />
          ) : (
            <ArrowCircleUpIcon
              className="btn"
              sx={{ color: message ? '#0056b3' : 'gray' }}
            />
          )}
        </button>
      </div>
      {showEscalate &&
      <button onClick={handleEscalate} className="escalate-button">
      Escalate
    </button> }
      
    </div>
  );
};

export default InputBox;
