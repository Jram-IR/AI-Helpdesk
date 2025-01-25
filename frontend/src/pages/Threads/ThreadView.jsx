import React, {useEffect,useState}from 'react'
import { useParams } from 'react-router-dom'
import Thread from '../../components/Thread'
import InputBox from '../../components/InputBox'
import './ThreadView.css'
import AdminAppBar from '../../components/AdminAppBar'
import { jwtDecode } from 'jwt-decode'
import { transformThreadData } from '../../helpers/chatUtlis'
import { CORE_BASE_URL, SERVER_BASE_URL } from '../../constants'

const ThreadView = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [threadMessages, setThreadMessages] = useState([])
  const [renderChat, setRenderChat] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEscalate, setShowEscalate]  = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [details, setDetails] = useState("")
  const [threadId, setThreadId] = useState(id)
  const handleSentMessage = (msg) => {
    const newMessage = {
        id: threadMessages.length + 1,
        author: details.name,
        content: msg,
        participantType: details.desig === 'user' ? 'user' : 'agent'
    };
   
    // Add the new message immediately to the chat
    setThreadMessages((prev) => [...prev, newMessage]);
    console.log("Message ", msg)
    setMessage(msg)
    setIsLoading(true)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const details = jwtDecode(token)
    setDetails(details)
    if (details.desig === 'admin'){
      setIsAdmin(true)
      console.log('admin')
      
    }else{
      setShowEscalate(true) // if user show the escalate button
      console.log('user')
    }

  },[])

    //user as qa to ai
    const handleUserQa = async () => {
      try{
          
          const userDetails = details
          const reqBody = JSON.stringify({
              thread_id: threadId,
              query  : message,
              userEmail: userDetails.email,
              dept:  "devops",
              uname: userDetails.name
              
              })
              
              setShowEscalate(true)
              const url = CORE_BASE_URL + "qa"
              const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                      'Content-Type' : 'application/json',
                      
                  },
                  body: reqBody
              })
              if(!response.ok){
                  throw new Error("HTTP error could not send the query!")
              }else{
                  const data = await response.json()
                  setRenderChat(true)
                  setMessage("")
                  setThreadId(data.qid)
                  console.log(data.response)
              }
              
          }catch(error){
              console.log(error)
          }
      }
    
    //admin responds to the user    
    const handleAdminResp = async () => {
      try{
          const adminDetails = details
          const reqBody = JSON.stringify({
              thread_id: threadId,
              response  : message,
              admin_details: {
                dept: adminDetails.dept,
                adminName: adminDetails.name,
                email: adminDetails.email
              }
            })
              const url = CORE_BASE_URL + "resolve"
              const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                      'Content-Type' : 'application/json',
                      
                  },
                  body: reqBody
              })
              if(!response.ok){
                  throw new Error("HTTP error could not send the query!")
              }else{
                  console.log("response by admin!")
                  setRenderChat(true)
              }
              
          }catch(error){
              console.log(error)
          }
      }

    //user escalates query
    const handleEscalation = async  (msg) => {
      try{
        const adminDetails = details
        const reqBody = JSON.stringify({
            thread_id: threadId,
            query_to_escalate  : msg,
            dept : "devops"
          })
            const url = CORE_BASE_URL + "escalate"
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    
                },
                body: reqBody
            })
            if(!response.ok){
                throw new Error("HTTP error could not send the query!")
            }else{
                console.log("escalated by user!")
                setRenderChat(true)
            }
            
        }catch(error){
            console.log(error)
        }
    }
    
    //refresh chat 
    useEffect(() => {
      const fetchData = async () => {
          const  token = localStorage.getItem('token')
          const url = SERVER_BASE_URL + "thread"
  
          if (!token) {
              console.error('No token found in local storage!');
              return;
            }
          try {
              const reqBody = JSON.stringify({
                id: threadId,
                dept: "devops"

              });
              const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  },
                  body: reqBody
                  });
  
                  if(!response.ok){
                  throw new Error("HTTP error! Something went wrong")
                  }
                  const data = await response.json()
                  const messages = transformThreadData(data)
                  console.log(messages)
                  setThreadMessages(messages)
                  setIsLoading(false)
                  setRenderChat(false)
          }
          catch(error){
              console.log(error)
          }
      
      }
      fetchData();
      }, [renderChat])
    
    useEffect(() => {
      if (!message.trim()) {
          // Don't send empty or whitespace-only messages
          return;
      }
      console.log("message change", message)
      if(!isAdmin){
        handleUserQa()
      }else{
        handleAdminResp()
      }
    },[message])
    
  
  return (
    <div className='threadView'>
        <Thread threadData = {threadMessages}/>
        <InputBox className= 'input' handleSentMessage = {handleSentMessage} isLoading = {isLoading} 
        showEscalate = {showEscalate} handleEscalation = {handleEscalation}/>
    </div>
  )
}

export default ThreadView