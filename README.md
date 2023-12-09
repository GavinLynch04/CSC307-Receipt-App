# CSC307-Receipt-App

This project is designed to help split receipts among multiple different people, and make the task of divying up 
receipts much easier. Includes the ability to upload or capture a picture of a receipt, where it will be processed for easier 
understanding and spliting by you. QuickSplit implements VeryFi API technology for its OCR/Receipt processing.

# Development Environment Setup

1. After cloning the project...
2. Navigate to CSC307-Receipt-App/packages/backend in the terminal
3. Run npm start
4. In a new terminal navigate to CSC307-Receipt-App/packages/frontend
5. Run npm start
6. Go to your web browser and navigate to localhost:3000 (if it doesn't automatically launch)
7. That's it!

# Code Guidlines

## Overview

For our project code style guidlines, we decided to follow the general Prettier guidlines, which are listed below.

## Coding Standards

- **JavaScript/React**:

  - Indentation: 2 spaces.
  - Semicolons at the end of statements.
  - Trailing commas where possible.
  - Line length: Prettier will automatically wrap code to the configured line length (default is 80 characters).
  - Avoid magic numbers when possible
  - Use const for variables that do not change and let for those that do

- **Other Languages**: For other languages used in the project (e.g., HTML, CSS, JSON), we are using the default Prettier guidlines.
