import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS Files/ImageCapture.css';

//Image capture component
const ImageCapture = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false); // New loading state
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const captureImage = () => {
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        const imageDataUrl = canvasRef.current.toDataURL('image/png');
        setImage(imageDataUrl);
        setIsWebcamActive(false);
    };

    //Handles the backend request to upload the file
    const handleFileUpload = async () => {
        const fetchResponse = await fetch(image);
        const blob = await fetchResponse.blob();
        const formData = new FormData();
        formData.append('file', blob, 'image.png');
    
        try {
            const token = localStorage.getItem('token');
            console.log(token);
            const uploadResponse = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (!uploadResponse.ok) {
                throw new Error(`HTTP error! Status: ${uploadResponse.status}`);
            }
    
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
            }
        } catch (error) {
            setLoading(false);
            console.error('Error uploading file:', error);
        }
    };

    //Starts the screen to take a picture
    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
                setIsWebcamActive(true);
            })
            .catch(err => {
                console.error('Error accessing webcam:', err);
                setIsWebcamActive(false);
            });
    };

    //Restarts image screen
    const retakeImage = () => {
        setImage(null);
        startVideo();
    };


    return (
        <div className="file-upload-container">
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            )}
            {!image && <video ref={videoRef} autoPlay playsInline width="640" height="480" />}
            {isWebcamActive && <button className="button" onClick={captureImage}>Capture</button>}
            <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
            {image && (
                <div>
                    <img src={image} alt="Captured" width="640" height="480" />
                    <button className="button" onClick={retakeImage}>Retake</button>
                    <button className={'upload'} onClick={handleFileUpload}>Upload</button>
                </div>
            )}
            {!isWebcamActive && !image && <button className="button" onClick={startVideo}>Start Webcam</button>}
        </div>
    );
};


export default ImageCapture;
