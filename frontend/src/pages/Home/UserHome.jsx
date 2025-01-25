import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import FaqBar from '../../components/FaqBar'
import Issue from '../../components/Issues'
import { jwtDecode } from 'jwt-decode'
import { Fab} from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import './UserHome.css'
import Profile from '../../components/Profile'
import { CORE_BASE_URL, SERVER_BASE_URL } from '../../constants'
import { fontSize } from '@mui/system'
const UserHome = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [isResolved, setIsResolved] = useState(false);
  const dept = 'devops'; // Hardcoded for now
  const handleFabClick = () => {
    navigate('/thread');
  };
  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 500,
      fontSize: '16px',
    },
  });
  useEffect(() => {
    const fetchIssues = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage!');
        return;
      }

      const {email } = jwtDecode(token);
    
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
        setIssues(data.filter(issue => issue.userEmail === email));
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

  const acceptResolution = async (thread_id) => {
    const reqBody = JSON.stringify({ thread_id, dept });
      console.log('reqBody', reqBody);
      const url = CORE_BASE_URL + 'accept';
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: reqBody
        });

        if (!response.ok) {
          throw new Error('HTTP error! Something went wrong');
        }
        // setIsResolved(true); //if response is ok.
        setIssues((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === thread_id ? { ...issue, adminInt: 'resolved' } : issue
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className= 'userHomeParent'>
      <div className='userHome'>
        <FaqBar className = 'faqBar'/>
        <div className="profile">
          <Profile/>
        </div>
      </div>
    <Issue className = 'issues' issues={issues} isResolved = {isResolved} acceptResolution = {acceptResolution} />
    <CustomTooltip title="Create New Thread" arrow>
    <Fab sx={{backgroundColor: 'rgb(179, 3, 179)'}}
        color="primary"
        aria-label="add"
        className="fab"
        onClick={handleFabClick}
      >
        <AddIcon />
      </Fab>
      </CustomTooltip>
    </div>
  )
}

export default UserHome