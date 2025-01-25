import React, { useEffect, useState } from 'react';
import FaqBar from '../../components/FaqBar';
import EscalatedQueries from '../../components/EscalatedQueries';
import { jwtDecode } from 'jwt-decode';
import './AdminHome.css';
import Profile from '../../components/Profile';
import { SERVER_BASE_URL } from '../../constants';
import AdminAppBar from '../../components/AdminAppBar';

const AdminHome = () => {
  const [issues, setIssues] = useState([]);
  const dept = 'devops'; // Hardcoded for now

  useEffect(() => {
    const fetchIssues = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage!');
        return;
      }

      const { email } = jwtDecode(token);
      const reqBody = JSON.stringify({ email, dept });
      console.log('reqBody', reqBody);
      const url = SERVER_BASE_URL + 'allThreads';
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: reqBody
        });

        if (!response.ok) {
          throw new Error('HTTP error! Something went wrong');
        }

        const data = await response.json();
        setIssues(data.filter(issue => issue.isEscalated ||  issue.resolvedBy === 'human'));
      } catch (error) {
        console.error(error);
      }
    };

    fetchIssues();
  }, []);

  useEffect(() => {
    if (issues.length > 0) {
      console.log(issues);
    }
  }, [issues]);

  return (
    <div className='adminHomeParent'>
      {/* <div className='adminHome'>
        <AdminAppBar/>
      </div> */}
      <EscalatedQueries className='escalatedQueries' issues={issues} />
    </div>
  );
};

export default AdminHome;
