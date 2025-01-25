import React from 'react'
import { useState } from 'react'; 
import './Register.scss'
import { useNavigate } from 'react-router-dom';
import { Button, Chip, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { SERVER_BASE_URL } from '../constants';

const Register = () => {
    const [selectedRole, setSelectedRole] = useState('user');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dept: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        dept: ''
    });
  
    const handleChipClick = (role) => {
        setSelectedRole(role);
        // Clear department error when switching to user role
        if (role === 'user') {
            setErrors(prev => ({ ...prev, dept: '' }));
        }
    };

    const navigate = useNavigate();
    
    const handleLoginClick = () => {
        navigate('/login');
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
            case 'name':
                setErrors(prev => ({
                    ...prev,
                    name: !value.trim() ? 'Name is required' : ''
                }));
                break;
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
                             value.length < 6 ? 'Password must be at least 6 characters long' : ''
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
      // Validate name
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
        isValid = false;
      }
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
      } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters long';
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
  const handleSignUp = async () => {
    if (!validateForm()) {
        return;
    }

    try {
      let reqBody;
        if (selectedRole === 'admin'){
            reqBody = JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              dept: formData.dept
          })
        }else{
            reqBody = JSON.stringify({
              uname: formData.name,
              email: formData.email,
              password: formData.password
          })
        }
        const uri = SERVER_BASE_URL + selectedRole + "/signup"
        const response = await fetch(uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            
            body: reqBody
        });

        if (response.ok) {
            console.log(selectedRole + "registered successfully")
            console.log(response)
            toast.success("Registration successful!")
        } else {
            const errorData = await response.json();
            console.log(errorData)
            toast.error("Error in registering " + selectedRole )
        }
    } catch (error) {
        console.error('Registration error:', error);
        toast.error("Error in registering " + selectedRole )
    }
};

    return (
        <div className='parent'>
            <div className="register">
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
                <h1>Sign Up!</h1>
                <div className="body">
                    <TextField 
                        className="name" 
                        label="Enter Name" 
                        fullWidth
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    <TextField 
                        className="email" 
                        label="Enter Email" 
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
                    <Button className="RegisterBtn" variant="contained" color="primary" onClick={handleSignUp}>
                        Sign Up
                    </Button>
                    <div className='loginPrompt' onClick={handleLoginClick}>
                        Already have an account ? Login Here
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
};

export default Register;