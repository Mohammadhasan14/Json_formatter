import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import JSONFormatter from 'json-formatter-js';

function Start() {
  const [jsonData, setJsonData] = useState(null); 
  const [rawJson, setRawJson] = useState(''); 
  const [file, setFile] = useState(null); 
  const [error, setError] = useState(''); 
  const formatterRef = useRef(null); 

  
  useEffect(() => {
    if (jsonData) {
      const formatter = new JSONFormatter(jsonData, 2); 
      if (formatterRef.current) {
        formatterRef.current.innerHTML = ''; 
        formatterRef.current.appendChild(formatter.render());
      }
    }
  }, [jsonData]); 

  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setError('');
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsedJson = JSON.parse(reader.result);
          setJsonData(parsedJson);
          setRawJson(JSON.stringify(parsedJson, null, 2)); 
          setFile(file);
        } catch (err) {
          setError('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a valid JSON file.');
    }
  };

  
  const handleJsonChange = (event) => {
    setRawJson(event.target.value); 
  };

  
  const handleDownload = async () => {
    try {
      const response = await axios.post('http://localhost:5000/save-edited-json', {
        jsonData: JSON.parse(rawJson),
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'edited-file.json');
      document.body.appendChild(a);
      a.click();
    } catch (err) {
      setError('Error downloading the file.');
    }
  };

  return (
    <div className="App">
      <h1>JSON Formatter and Editor</h1>

  
      <input type="file" accept=".json" onChange={handleFileUpload} />
      {error && <div style={{ color: 'red' }}>{error}</div>}

  
      {jsonData && (
        <div>
          <h2>Edit JSON</h2>
          <textarea
            value={rawJson}
            onChange={handleJsonChange}
            rows="10"
            cols="50"
            placeholder="Edit the JSON here..."
          />
          <h3>Formatted JSON:</h3>
          <div id="json-formatter-js" ref={formatterRef}></div>
          <button onClick={handleDownload}>Download Edited JSON</button>
        </div>
      )}
    </div>
  );
}

export default Start;
