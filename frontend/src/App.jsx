import Login from "./components/Login";
import Register from "./components/Register";
import Thread from "./components/Thread";
import { BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import { useState } from 'react';
import ThreadView from "./pages/Threads/ThreadView";
import Issue from "./components/Issues";
import UserHome from "./pages/Home/UserHome";
import AdminChat from "./pages/AdminChat/AdminChat";
import AdminHome from "./pages/Home/AdminHome";
import AdminAppBar from "./components/AdminAppBar";
import Faq from "./components/Faq";
import FaqPage from "./pages/Faq/FaqPage";
const AdminWrapper = ({ children, adminbar }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div>
      {isAdminRoute && adminbar}
      {children}
    </div>
  );
};
function App() {
  const [adminbar] = useState(<AdminAppBar/>);
  return (
    <BrowserRouter>
      <AdminWrapper adminbar={adminbar}>
      <Routes>
        {/* Root path is login */}
        <Route path="/" element={<Login/>} />
        
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        {/* Route without an ID for new thread*/}
        <Route path="/thread" element={<ThreadView />} />
        {/* Route with an ID existing thread*/}
        <Route path="/thread/:id" element={<ThreadView />} />
        <Route path="admin/thread/:id" element={<ThreadView />} />
        <Route path="/admin/chat" element={<AdminChat/>} />
        <Route path="/home" element={<UserHome/>} />
        <Route path="admin/home" element={<AdminHome/>} />
        <Route path="admin/faq" element={<FaqPage/>} />
        <Route path="/faq" element={<FaqPage/>} />
      </Routes>
      </AdminWrapper>
    </BrowserRouter>
  );
}

export default App;
