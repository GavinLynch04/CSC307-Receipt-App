import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import "./CSS Files/PopUp.css";


const PopupButton = (props) => {
    // Initialize the popup to closed
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Gets the contents of the popup from props
    const popupData = props.popupData;

    // Opens the popup
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Closes the popup
    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        Modal.setAppElement('#root');
    }, []);

    return (
        <div className="modalContainer">
            <button onClick={openModal} className='calculate'>
                Submit
            </button>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Popup Modal"
                // Color settings
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    content: {
                        maxWidth: '400px',
                        margin: 'auto',
                        padding: '20px',
                        backgroundColor: '#fff',
                        borderRadius: '5px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    },
                }}

                // Button to close the popup
            >
                <div>
                    {popupData.map((item, index) => (
                        <div key={index} className='modalText'>{item}</div>
                    ))}
                    <button onClick={closeModal} className='closeButton'>
                        X
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default PopupButton;
