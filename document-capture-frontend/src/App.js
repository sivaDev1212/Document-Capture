import React from 'react';
import DocumentUpload from './DocumentUpload';

function App() {
  return (
    <div className="App">
      <div className='heading'>
      <h1>Document Capture</h1>
      <p> Please upload the passport file</p>
      </div>

      <DocumentUpload />
    </div>
  );
}

export default App;
