import React from "react";
import { useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "./CSS Files/Header.css";

function Header() {

    const navRef = useRef();

    //Toggles the navbar
    const showNavbar = () => {
        navRef.current.classList.toggle(
            "responsive_nav"
        );
    };

    // Buttons for the navigation bar at the top of the screen
    return (
        <header>
            <h3>QuickSplit</h3>
            <nav ref={navRef}>
                <a href="/home">Home</a>
                <a href="/imageUpload">Image Upload</a>
                <a href="/imageCapture">Image Capture</a>
                <button
                    className="navigation-button navigation-close-button"
                    onClick={showNavbar}>
                    <FaTimes />
                </button>
            </nav>
            <button
                className="navigation-button"
                onClick={showNavbar}>
                <FaBars />
            </button>
        </header>
    );
}

export default Header;