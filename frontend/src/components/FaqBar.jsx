import { Button } from '@mui/material'
import React from 'react'
import './FaqBar.css'
import { useNavigate } from 'react-router-dom'
import Profile from './Profile'
const FaqBar = () => {
  const navigate = useNavigate()
  const handleViewFaq = () => {
    navigate('/faq')
  }
  return (
    
      <div className='Faq'>
          <span className='descp'>You can view the frequently Asked questions before opening new issues</span>
          <Button className='faqBtn' onClick={handleViewFaq}> View </Button>
      </div>
  )
}

export default FaqBar