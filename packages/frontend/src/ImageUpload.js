import React, {useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS Files/ImageUpload.css';

//Image upload component
const ImageUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); // New loading state
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    //Handles the uploaded file
    const handleFileChange = (e) => {
            setFile(e.target.files[0]);
        };

    //Sends the file to the backend
    const handleFileUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            //If user accepts, will send the image to the api to be processed
            const userConfirmed = window.confirm('File uploaded successfully. Do you want to process this data?');
            if (userConfirmed) {
                setLoading(true);
                const token = localStorage.getItem('token');
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                };
                fetch('http://localhost:8000/process', requestOptions)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        console.log('File processed successfully:', data);
                    })
                    .catch((error) => {
                        console.error('Error uploading file:', error.message);
                    })
                    .finally(() => {
                        setLoading(false);
                        navigate("/home");
                    });
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setLoading(false);
        }
        console.log('File uploaded successfully');
    };

    //Handles the file drag over
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    //Handles file drop
    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        setFile(droppedFile);
    };

    //Opens file picker when the drop zone is clicked
    const handleDropZoneClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="file-upload-container">
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            )}
            <div
                className="drop-zone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleDropZoneClick}
            >
                <p>Drag & Drop a file here or click to select a file</p>
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{display: 'none'}}
                    ref={fileInputRef}
                />
            </div>
            {file && (
                <div>
                    <p>Selected File: {file.name}</p>
                    <button className={'upload'} onClick={handleFileUpload}>Upload</button>
                </div>
            )}
        </div>
    );
}

export default ImageUpload;