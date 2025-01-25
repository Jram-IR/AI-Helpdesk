import { jwtDecode } from "jwt-decode";

const name = jwtDecode(localStorage.getItem('token')).name
export function transformChatData(apiResponse) {
    if (!apiResponse?.chat) {
        throw new Error('Invalid API response format');
    }
    
    const transformedMessages = [];
    
    apiResponse.chat.forEach((messagePair) => {
        // Handle the human message
        const humanMessage = {
            id: transformedMessages.length + 1,
            author: name,
            content: messagePair.human,
            participantType: "user"
        };
        transformedMessages.push(humanMessage);
    
        // Handle the system/AI message
        let content = messagePair.system;
        let codeSnippets = [];
        
        // Find all code blocks using regex
        const codeRegex = /```(\w*)\s*([\s\S]*?)```/g;
        let match;
        let lastIndex = 0;
        
        // Collect all matches and their positions
        while ((match = codeRegex.exec(content)) !== null) {
            const language = match[1] || 'text';
            const code = match[2].trim();
            const fullMatch = match[0];
            const startIndex = match.index;
            const endIndex = startIndex + fullMatch.length;
            
            codeSnippets.push({
                language,
                code,
                startIndex,
                endIndex
            });
            
            lastIndex = endIndex;
        }
        
        // If we found code snippets, process the content
        if (codeSnippets.length > 0) {
            // Remove all code blocks from content and clean up
            content = content.split('```').filter((_, index) => index % 2 === 0).join(' ').trim();
        }
        
        const systemMessage = {
            id: transformedMessages.length + 1,
            author: "AI Assistant",
            content: content,
            participantType: "assistant"
        };
        
        if (codeSnippets.length > 0) {
            systemMessage.codeSnippets = codeSnippets.map(({ language, code }) => ({
                language,
                code
            }));
        }
        
        transformedMessages.push(systemMessage);
    });
    console.log(transformedMessages)
    return transformedMessages;
}

export function transformThreadData(apiResponse){
    if (!apiResponse?.thread) {
        throw new Error('Invalid API response format');
    }
    
    const transformedMessages = [];
    const  uname = apiResponse.details.uname; 
    
    apiResponse.thread.forEach((threadItem) => {
        // Handle the human message
        const userMessage = {
            id: transformedMessages.length + 1,
            author: uname,
            content: threadItem.Question,
            participantType: "user"
        };
        transformedMessages.push(userMessage);
    
        // Handle the agent/AI message
        let content = threadItem.Answer;
        let codeSnippets = [];
        
        // Find all code blocks using regex
        const codeRegex = /```(\w*)\s*([\s\S]*?)```/g;
        let match;
        let lastIndex = 0;
        
        // Collect all matches and their positions
        while ((match = codeRegex.exec(content)) !== null) {
            const language = match[1] || 'text';
            const code = match[2].trim();
            const fullMatch = match[0];
            const startIndex = match.index;
            const endIndex = startIndex + fullMatch.length;
            
            codeSnippets.push({
                language,
                code,
                startIndex,
                endIndex
            });
            
            lastIndex = endIndex;
        }
        
        // If we found code snippets, process the content
        if (codeSnippets.length > 0) {
            // Remove all code blocks from content and clean up
            content = content.split('```').filter((_, index) => index % 2 === 0).join(' ').trim();
        }
        
        const systemMessage = {
            id: transformedMessages.length + 1,
            author: threadItem.AnswerBy != "ai" ? "Admin: " + threadItem.AnswerBy : "AI Assistant",
            content: content,
            participantType: threadItem.AnswerBy != "ai" ? "agent" : "assistant"
        };
        
        if (codeSnippets.length > 0) {
            systemMessage.codeSnippets = codeSnippets.map(({ language, code }) => ({
                language,
                code
            }));
        }
        
        transformedMessages.push(systemMessage);
    });
    console.log(transformedMessages)
    return transformedMessages;
}
