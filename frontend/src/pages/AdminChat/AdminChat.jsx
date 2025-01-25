import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AdminAppBar from '../../components/AdminAppBar'
import './AdminChat.css'
import InputBox from '../../components/InputBox'
import Chat from '../../components/Chat'
import { transformChatData } from '../../helpers/chatUtlis'
import { jwtDecode } from 'jwt-decode'
import { CORE_BASE_URL, SERVER_BASE_URL } from '../../constants'

const AdminChat = () => {
    const { cid } = useParams();
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([])
    const [renderChat, setRenderChat] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [chatId, setChatId] = useState(cid)
    const handleSentMessage = (msg) => {
        const newMessage = {
            id: chatMessages.length + 1,
            author: 'You',
            content: msg,
            participantType: 'user',
        };
        // Add the new message immediately to the chat
        setChatMessages((prev) => [...prev, newMessage]);
        console.log("Message ", msg)
        setMessage(msg)
        setIsLoading(true)
        
    }
    
    useEffect(() => {
        
    const fetchData = async () => {
        
        const  token = localStorage.getItem('token')
        if(chatId === undefined){return}
        const url = SERVER_BASE_URL + "admin/qa/all/" + chatId
        if (!token) {
            console.error('No token found in local storage!');
            return;
            }
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                });

                if(!response.ok){
                throw new Error("HTTP error! Something went wrong")
                }
                const data = await response.json()
                const messages = transformChatData(data)
                console.log(messages)
                setChatMessages(messages)
                setIsLoading(false)
                setRenderChat(false)
        }
        catch(error){
            console.log(error)
        }
    
    }
    fetchData();
    }, [renderChat, chatId])

    
    useEffect(() => {
        if (!message.trim()) {
            // Don't send empty or whitespace-only messages
            return;
        }
        const handleAdminQa = async () => {
            try{
                const token = localStorage.getItem('token')
                const adminDetails = jwtDecode(token)
                const reqBody = JSON.stringify({
                
                    chat_id: chatId === undefined ? "" : chatId,
                    msg  : message,
                    email: adminDetails.email,
                    dept:  adminDetails.dept
                    
                    })
                    const url = CORE_BASE_URL + "admin/qa"
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type' : 'application/json',
                            
                        },
                        body: reqBody
                    })
                    if(!response.ok){
                        throw new Error("HTTP error could not send the query!")
                    }else{
                        const data = await response.json()
                        console.log("Chat id ", data.qid)
                        setChatId(data.qid)
                        setRenderChat(true)
                        console.log(data.response)
                    }
                    
                }catch(error){
                    console.log(error)
                }
            }
            handleAdminQa()
            
        },[message])
    
        
    return (
    <div className='threadView'>
        <Chat chatMessages = {chatMessages}/>
        <InputBox className= 'input' handleSentMessage = {handleSentMessage} isLoading = {isLoading} showEscalate={false}/>
    </div>
  )
}

export default AdminChat