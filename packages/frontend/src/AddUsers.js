import React, {useState} from "react";
import "./CSS Files/AddUsers.css"

function InputField({ onInputChange }) {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Data validation to ensure the field is not empty
        if (inputValue !== "") {
            onInputChange(inputValue);
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ textAlign: 'center' }} className={"userForm"}>
            <input className={"username"}
                type="text"
                placeholder={"Input a name to update or add new buttons"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className={"submitButton"}>Submit</button>
        </form>
    );
}

export default InputField;

