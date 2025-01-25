
import React from 'react';
import { Card, CardContent, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './EscalatedQueries.css';

const EscalatedQueries = ({ issues }) => {
  const navigate = useNavigate();
  const handleIssueClick = (id) => {
    navigate(`/admin/thread/${id}`);
  };

  return (
    <div className="issues-container">
      {issues.map(({ id, title, adminInt, isEscalated, userEmail }, idx) => {
        let backgroundColor;
        let chipClass;

        switch (adminInt) {
          case 'pending':
            backgroundColor = '#FFF9C4'; // Light yellow for pending
            chipClass = 'pen';
            break;
          case 'resolved':
            backgroundColor = '#C8E6C9'; // Light green for resolved
            chipClass = 'res';
            break;
          case 'unseen':
            backgroundColor = '#E0E0E0'; // Light gray for unseen
            chipClass = 'unseen';
            break;
          default:
            backgroundColor = '#E0E0E0'; // Default light gray
            chipClass = 'res';
        }

        return (
          <Card key={idx} className="issue-card" style={{ backgroundColor }} onClick={() => handleIssueClick(id)}>
            <CardContent>
              <div className={`escalation-status ${isEscalated ? 'escalated' : ''}`}>
                {isEscalated ? 'Escalated' : 'Not Escalated'}
              </div>
              <h3 className="issue-title" title={title}>{title}</h3>
              <p className="issue-id">Id: {id.slice(-4)}</p>
              <p className="issue-from">From: {userEmail}</p>
              <Chip
                label={adminInt.charAt(0).toUpperCase() + adminInt.slice(1)}
                className={`status-chip ${chipClass}`}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EscalatedQueries;