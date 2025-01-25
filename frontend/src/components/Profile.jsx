import React from 'react'
import { AuthenticationContext, SessionContext } from '@toolpad/core/AppProvider';
import { Account } from '@toolpad/core/Account';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
const demoSession = {
  user: {
    name: jwtDecode(localStorage.getItem('token')).name ,
    email: jwtDecode(localStorage.getItem('token')).email,
    image: '',
  },
};
const Profile = () => {
    const nav = useNavigate()
    const [session, setSession] = React.useState(demoSession);
    const authentication = React.useMemo(() => {
      return {
        signIn: () => {
          setSession(demoSession);
        },
        signOut: () => {
          setSession(null);
          localStorage.removeItem('token');
          nav('/login')
        },
      };
    }, []);
  return (
    <AuthenticationContext.Provider value={authentication}>
    <SessionContext.Provider value={session}>
      <Account />
    </SessionContext.Provider>
  </AuthenticationContext.Provider>
  )
}

export default Profile