import { Button, Card, TextField, Chip } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import { toast, ToastContainer } from 'react-toastify';
import { SERVER_BASE_URL } from '../constants';
import { jwtDecode } from 'jwt-decode';
const Login = () => {
    const [selectedRole, setSelectedRole] = useState('user');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        dept: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        dept: ''
    });

    const navigate = useNavigate();

    const handleChipClick = (role) => {
        setSelectedRole(role);
        // Clear department error when switching to user role
        if (role === 'user') {
            setErrors(prev => ({ ...prev, dept: '' }));
        }
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validate fields on change
        switch (field) {
            case 'email':
                setErrors(prev => ({
                    ...prev,
                    email: !value ? 'Email is required' : 
                           !validateEmail(value) ? 'Please enter a valid email' : ''
                }));
                break;
            case 'password':
                setErrors(prev => ({
                    ...prev,
                    password: !value ? 'Password is required' :
                             value.length < 5 ? 'Password must be at least 5 characters long' : ''
                }));
                break;
            case 'dept':
                if (selectedRole === 'admin') {
                    setErrors(prev => ({
                        ...prev,
                        dept: !value.trim() ? 'Department is required' : ''
                    }));
                }
                break;
            default:
                break;
        }
    };
    const validateForm = () => {
      let isValid = true;
      const newErrors = { ...errors };
    
      // Validate email
      if (!formData.email) {
          newErrors.email = 'Email is required';
          isValid = false;
      } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email';
          isValid = false;
      }

      // Validate password
      if (!formData.password) {
          newErrors.password = 'Password is required';
          isValid = false;
      } else if (formData.password.length < 5) {
          newErrors.password = 'Password must be at least 5 characters long';
          isValid = false;
      }

      // Validate department for admin
      if (selectedRole === 'admin' && !formData.dept.trim()) {
          newErrors.dept = 'Department is required';
          isValid = false;
      }

      setErrors(newErrors);
      return isValid;
  };
  const handleLogin = async () => {
    if (!validateForm()) {
        return;
    }
    try {
      let reqBody;
      if(selectedRole == 'admin'){
        reqBody = JSON.stringify({
          email: formData.email,
          password: formData.password,
          dept : formData.dept
        })
      }else{
        reqBody = JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      }
        const url = SERVER_BASE_URL + selectedRole + "/login"
        console.log(url)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            
            body: reqBody
        });

        if (response.ok) {
            const data = await response.json();
            // Store token if provided
            const jwt = jwtDecode(data.JWT)
            localStorage.setItem('token', data.JWT)
            console.log(selectedRole + " log in successfull")
            console.log(data)
            // Redirect to login page
            if(jwt.desig==="admin"){
                navigate('/admin/home');
            }else{
                navigate('/home');
            }
        } else {
            const errorData = await response.json();
            console.log(errorData)
            toast.error("Error in logging you in")
        }
    } catch (error) {
        console.error('Login error:', error);
        toast.error("Error in logging you in")
    }
};


    return (
        <div className='logParent'>
            <div className="login">
                <div className="chips">
                    <Chip
                        label="User"
                        className={`userChip ${selectedRole === 'user' ? 'selected' : ''}`}
                        onClick={() => handleChipClick('user')}
                    />
                    <Chip
                        label="Admin"
                        className={`adminChip ${selectedRole === 'admin' ? 'selected' : ''}`}
                        onClick={() => handleChipClick('admin')}
                    />
                </div>
                <h1>Login</h1>
                <div className="body">
                    <TextField 
                        className="email" 
                        label="Enter email" 
                        fullWidth
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                    />
                    {selectedRole === 'admin' && (
                        <TextField 
                            className="dept" 
                            label="Enter Department" 
                            fullWidth
                            value={formData.dept}
                            onChange={handleInputChange('dept')}
                            error={!!errors.dept}
                            helperText={errors.dept}
                        />
                    )}
                    <TextField 
                        className="password" 
                        label="Enter password" 
                        fullWidth 
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        error={!!errors.password}
                        helperText={errors.password}
                    />
                    <Button className="loginBtn" onClick={handleLogin} variant="contained" color="primary">
                        Login
                    </Button>
                    <div className='regPrompt' onClick={handleRegisterClick}>
                        Don't have an account ? Sign Up!
                    </div>
                </div>
            </div>
              <ToastContainer/>
        </div>
    );
};

export default Login;