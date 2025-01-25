import React from 'react';
import { Card, CardContent, Chip, Button, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import './Issue.css';

const Issue = ({ issues, acceptResolution, isResolved }) => {
  const navigate = useNavigate();
  const handleIssueClick = (id) => {
    navigate(`/thread/${id}`);
  };
  const handleFabClick = () => {
    navigate('/thread');
  };
  return (
    <div className="issues-container">
      {issues.map(({ id, title, adminInt, isEscalated, resolvedBy },idx) => {
        //const borderColor = adminInt === 'pending' ? '#FFC107' : '#4CAF50';
        let borderColor;
        let chipClass;
        // adminInt = isResolved ? 'resolved' : adminInt;
        switch (adminInt) {
          case 'pending':
            borderColor = '#FFC107'; // Yellow for pending
            chipClass = 'pen';
            break;
          case 'resolved':
            borderColor = '#4CAF50'; // Green for resolved
            chipClass = 'res';
            break;
          case 'unseen':
            borderColor = '#9E9E9E'; // Gray for unseen
            chipClass = 'unseen';
            break;
          default:
            borderColor = '#9E9E9E'; // Default gray
            chipClass = 'res';
        }

        return (
          <Card key={idx} className="issue-card" style={{ borderColor }} onClick={() => handleIssueClick(id)}>
            <CardContent>
              <div
                className={`escalation-status ${isEscalated ? 'escalated' : ''}`}
              >
                {isEscalated ? 'Escalated' : 'Not Escalated'}
              </div>
              <h3 className="issue-title" title={title}>{title}</h3>
              <p className="issue-id">Id: {id.slice(-4)}</p>
              <Chip
                label={adminInt.charAt(0).toUpperCase() + adminInt.slice(1)}
                className={`status-chip ${chipClass}`}
              />
              {
                adminInt === 'resolved' && (
                  <div className={"resolved-by-icon " + resolvedBy} >
                    <>By:</> {resolvedBy === 'ai' ? <SmartToyIcon /> : <AdminPanelSettingsIcon />}
                  </div>
                )
              }
              {(adminInt === 'pending' || adminInt === 'unseen') && (
                <div className="button-container">
                  <Button
                    variant="contained"
                    color="primary"
                    className="resolve-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      acceptResolution(id)}}
                  >
                    CLOSE
                  </Button>
                </div>
              )}
              
            </CardContent>
          </Card>
        );
      })}
      
    </div>
  );
};

export default Issue;