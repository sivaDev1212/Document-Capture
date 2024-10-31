// src/DocumentUpload.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Messages } from 'primereact/messages';



function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const messages = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file)
        {
            messages.current.show({ severity: 'error', summary: 'Error', detail: 'No file selected for upload', life: 1000 });
            return;
        } 

    const formData = new FormData();
    formData.append('document', file);

    const response = await axios.post('/api/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setData(response.data);
    console.log("response",response.data);
    
    messages.current.show({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully!', life: 2000 });

  };

  return (
    <div>
      <div className='buttons'>
      <div className='upload'>
      <Messages ref={messages} />
        <input type="file" onChange={handleFileChange} />
      </div>
      <Button onClick={handleUpload} label="Upload and Extract" severity="success" outlined />
      
      </div>

      {data && (

            <Panel header="Personal Data">
            <p className="m-0">
                            
                                    <p><strong>Name:</strong> {data.name}</p>
                                    <p><strong>Passport Number:</strong> {data.passportNumber}</p>
                                    <p><strong>Nationality:</strong> {data.nationality}</p>
                                    <p><strong>Date of Birth:</strong> {data.dob}</p>
                                    <p><strong>Issue Date:</strong> {data.issueDate}</p>
                                    <p><strong>Expiration Date:</strong> {data.expirationDate}</p>
                            </p>
            </Panel>

                

       
      )}
    </div>
  );
}

export default DocumentUpload;
