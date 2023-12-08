import Header from "./Header";
import AddUsers from "./AddUsers";
import Table from "./Table";
import React, {useCallback, useEffect, useState} from "react";

const HomePage = () => {
    const [buttonLabels, setButtonLabels] = useState(['User 1', 'User 2', 'User 3']);
    const [jsonData, setJsonData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchDataAndUpdateState = useCallback(async () => {
        try {
            const res = await fetchData();

            if (!res.ok) {
                const json = await res.json();
                handleServerError(json.error);
                return;
            }

            const json = await res.json();
            setJsonData(json["data"]["line_items"]);
        } catch (error) {
            console.error(error);
        } finally {
            // Set dataLoading to false once data is fetched (success or error)
            setDataLoading(false);
        }
    });

    useEffect(() => {
        fetchDataAndUpdateState();
    }, [fetchDataAndUpdateState]);

    const handleInputChange = (newLabel) => {
        const updatedLabels = [...buttonLabels];

        if (currentIndex < updatedLabels.length) {
            updatedLabels[currentIndex] = newLabel;
        } else {
            updatedLabels.push(newLabel);
        }
        setButtonLabels(updatedLabels);
        setCurrentIndex(currentIndex + 1);
    };

    const handleServerError = (error) => {
        console.log(error);
        if (error === 'Please upload an image first') {
            setErrorMessage('You have not uploaded an image. Please upload an image.');
        } else if (error === 'User email not available') {
            setErrorMessage('User email is not available. Please log in again.');
        } else {
            setErrorMessage('Error fetching data. Please try again.');
        }
    };

    return (
        <div>
            <Header error={errorMessage}/>
            {errorMessage ? (
                <div style={{ color: 'red', margin: 'auto', maxWidth: '400px', marginTop: '10px' }}>
                    <p>{errorMessage}</p>
                </div>
            ) : (
                <div>
                    <AddUsers onInputChange={handleInputChange} />
                    {dataLoading ? (
                        <p>Loading data...</p>
                    ) : (
                        <Table jsonData={jsonData} buttonLabels={buttonLabels} />
                    )}
                </div>
            )}
        </div>
    );
};

function fetchData() {
    const token = localStorage.getItem('token');
    return fetch("http://localhost:8000/receipt", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
}

export default HomePage