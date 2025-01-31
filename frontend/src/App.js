import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

import ReactMarkdown from 'react-markdown';

const App = () => {
  const [file, setFile] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/upload-resume',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setKeywords(response.data.keywords);
      setChatHistory([]); // Clear chat history on new upload
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  // Handle chat submission
  const sendMessage = async () => {
    if (!chatMessage) return;

    const newChatHistory = [
      ...chatHistory,
      { role: 'user', content: chatMessage },
    ];

    setChatHistory(newChatHistory); // Update UI immediately

    try {
      const response = await axios.post('http://localhost:5000/chat', {
        message: chatMessage,
        resumeKeywords: keywords,
      });
      const botMessage = { role: 'assistant', content: response.data.response };
      setChatHistory([...newChatHistory, botMessage]);
      setChatMessage(''); // Clear input field
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error in chat communication.');
    }

    setChatMessage(''); // Clear input field
  };

  return (
    <div className='container'>
      <h1>AI Technical Interview</h1>

      {/* Resume Upload Section */}
      <div className='resume-upload'>
        <input
          type='file'
          accept='application/pdf'
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </div>

      {/* Display Extracted Keywords */}
      {keywords.length > 0 && (
        <div className='keywords'>
          <h3>Extracted Keywords:</h3>
          <p>{keywords.join(', ')}</p>
        </div>
      )}

      {/* Chat Section */}
      <div className='chat-container'>
        <div className='chat-box'>
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={msg.role === 'user' ? 'user-msg' : 'bot-msg'}
            >
              <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>{' '}
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
        </div>

        <div className='chat-input'>
          <input
            type='text'
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder='Type your message...'
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default App;
