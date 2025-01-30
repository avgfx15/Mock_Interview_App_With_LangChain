import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [file, setFile] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError('');
    setKeywords([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/upload-resume',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setKeywords(response.data.keywords);
    } catch (err) {
      setError('Failed to process the resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <h1>Resume Keyword Extractor</h1>
      <input type='file' accept='application/pdf' onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Processing...' : 'Upload & Extract Keywords'}
      </button>
      {error && <p className='error'>{error}</p>}
      {keywords.length > 0 && (
        <div className='keywords'>
          <h2>Extracted Keywords:</h2>
          <ul>
            {keywords.map((word, index) => (
              <li key={index}>{word}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
