import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Home, Chat, QuestionAnswer } from '@mui/icons-material';
import { useLocation } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';
import './AdminAppBar.css';
import Profile from './Profile';
import { toast, ToastContainer } from 'react-toastify';

const AdminAppBar = () => {
  const location = useLocation();  // Get the current location (route)
  const navigate = useNavigate();  // Get the navigate function
  // Derive active button state based on route
  const getActiveButton = () => {
    if (location.pathname.startsWith('/admin/chat')) {
      return 'chat';
    }
    if (location.pathname.startsWith('/admin/faq')) {
      return 'faqs';
    }
    return 'home';  // Default to 'home' if no specific route is matched
  };
  
  const activeButton = getActiveButton();  // Determine the active button

  const handleChatClick = () => {
    navigate('/admin/chat');
  };
  const handleHomeClick = () => {
    navigate('/admin/home');
  };
  
  const handleFaqClick = () => {
    navigate('/admin/faq');
  };
  
  

  return (
    <AppBar position="static" className="app-bar">
      <Toolbar className="toolbar">
        <div className="nav-items">
          <IconButton
            color="inherit"
            className={`nav-item ${activeButton === 'home' ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            <Home />
            <Typography variant="body1">Home</Typography>
          </IconButton>

          <IconButton
            color="inherit"
            className={`nav-item ${activeButton === 'chat' ? 'active' : ''}`}
            onClick={handleChatClick}
          >
            <Chat />
            <Typography variant="body1">Chat</Typography>
          </IconButton>

          <IconButton
            color="inherit"
            className={`nav-item ${activeButton === 'faqs' ? 'active' : ''}`}
            onClick={handleFaqClick}
          >
            <QuestionAnswer />
            <Typography variant="body1">FAQs</Typography>
          </IconButton>
        </div>

        <div className="profile-section">
          <Profile />
        </div>
      </Toolbar>
      <ToastContainer/>
    </AppBar>
  );
};

export default AdminAppBar;
