import express from "express";
import cors from "cors";
import mongoose from 'mongoose';
import fsPromises from 'fs/promises';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import request from 'request-promise';
import archiver from 'archiver';
import jwt from 'jsonwebtoken';

const app = express();
const port = 8000;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

dotenv.config();

//Creates the filepath and user email global vars
let relativeFilePath;
let userEmail;

//Connects to MongoDB Atlas server
mongoose.set("debug", true);
console.log(">>mongo cluster: " + process.env.MONGO_CLUSTER);
mongoose
    .connect(
        "mongodb+srv://" +
        process.env.MONGO_USER +
        ":" +
        process.env.MONGO_PWD +
        "@" +
        process.env.MONGO_CLUSTER +
        "/?retryWrites=true&w=majority",
        {
            useNewUrlParser: true, //useFindAndModify: false,
            useUnifiedTopology: true,
        }
    )
    .catch((error) => console.log(error));

//Creates schema to save users and user info
export const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

const User = mongoose.model('User', UserSchema);

const jwtSecret = process.env.JWT_SECRET;
//Error checking for JWT Secret
if (!jwtSecret) {
    console.error('JWT secret is not defined. Set the JWT_SECRET environment variable.');
    process.exit(1);
}

//Function to verify that the user has a valid web token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

//Endpoint to retrieve the JSON receipt data and return it to the frontend
app.get("/receipt", verifyToken, async (req, res) => {
    if (!userEmail) {
        console.log("No email");
        return res.status(500).json({ error: 'User email not available' });
    }

    const filePath = `./JSONuploads/${userEmail}.json`;

    try {
        await fsPromises.access(filePath, fsPromises.constants.F_OK);
        const data = await fsPromises.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json({ data: jsonData });
    } catch (err) {
        //If no previous receipts processed send user an error
        if (err.code === 'ENOENT') {
            console.log("Please upload an image first");
            res.status(500).json({ error: 'Please upload an image first' });
        } else {
            //General catch error
            res.status(500).json({ error: 'Error reading JSON file' });
        }
    }
});

//Initialize the storage var to store images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/'); // Save files to the 'uploads/' directory
    },
    filename: function (req, file, cb) {
        const uniqueFileName = Date.now() + '-' + file.originalname;
        req.uploadedFileName = uniqueFileName;
        cb(null, uniqueFileName);

        // Store the relative file path when the file is uploaded
        relativeFilePath = path.join('./uploads', req.uploadedFileName);
    }
});

const upload = multer({ storage: storage });

//Endpoint to upload the images from imageUpload or imageCapture
app.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    const file = req.file;

    //Check a file is uploaded
    if (!file) {
        return res.status(400).json({error: 'No file provided'});
    }
    const fileDetails = {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
    };
    res.status(200).json({ message: 'File uploaded successfully', file: fileDetails });
});

//Endpoint to register a new user
app.post("/register", async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const existingUser = await User.findOne({ email }).exec();
        //If user already exists, send a error message to frontend
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered. Please Login" });
        } else {
            //Encrypt password, then create the user and save it to MongoDB Atlas
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const user = new User({ username, password: hashedPassword, email });
            await user.save();
            userEmail = email;
            //Create the JWT
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'User registered successfully', token });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

//Endpoint to verify login attempts
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    //If user exists, then check the password matches. Otherwise return an error
    try {
        const existingUser = await User.findOne({ email }).exec();

        if (!existingUser) {
            return res.status(401).json({ error: "User not found, please sign up." });
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.password);

        if (passwordMatch) {
            //Sign the JWT for this session (exp in 1hr)
            const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            userEmail = email;
            res.json({ message: "Login successful", token });
        } else {
            res.status(401).json({ error: "Incorrect password." });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
const popupDataSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    content: { type: String, required: true },
});

const PopupData = mongoose.model('PopupData', popupDataSchema);

app.post('/savePopupData', verifyToken, async (req, res) => {
    try {
        const newPopupData = new PopupData(req.body); // Create a new instance of PopupData model with request body data
        await newPopupData.save(); // Save the new instance to the database

        res.status(200).json({ message: 'Popup data saved successfully' });
    } catch (err) {
        console.error('Error saving popup data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Endpoint to send the uploaded image to VeryFi API for receipt OCR processing
app.get("/process", verifyToken, async (req, res) => {
    //First part creates a ZIP file of the image to send to VeryFi
    const listFiles = [relativeFilePath];
    const zipFilePath = 'receipts.zip';

    const output = fs.createWriteStream(zipFilePath);

    const archive = archiver('zip', {
        zlib: { level: 9 },
    });

    archive.pipe(output);

    for (const file of listFiles) {
        archive.file(file, { name: file });
    }

    archive.finalize();
    //Define the values needed to authenticate the request
    output.on('close', async () => {

        const requestOptions = {
            'method': 'POST',
            'uri': 'https://api.veryfi.com/api/v7/partner/documents',
            'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'CLIENT-ID': process.env.CLIENT_ID,
                'AUTHORIZATION': 'apikey ' + process.env.USERNAME + ':' + process.env.API_KEY
            },
            'formData': {
                'file': {
                    'value': fs.createReadStream(zipFilePath),
                    'options': {
                        'filename': zipFilePath,
                        'contentType': 'application/zip',
                    },
                },
            },
        };

        //Send the request ot VeryFi, and save the response JSON as a
        // file with the users email in it for access later
        try {
            const response = await request(requestOptions);
            const responseData = typeof response === 'string' ? JSON.parse(response) : response;
            fs.writeFileSync(`./JSONuploads/${userEmail}.json`, JSON.stringify(responseData, null, 2));
            res.status(200).json({ message: 'File processed successfully' });
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

//Endpoint to get the popup data
app.get('/getPopupData', verifyToken, async (req, res) => {
    try {
        const popupData = await PopupData.find({}); // Fetch all documents from PopupData collection
        res.json(popupData);
    } catch (err) {
        console.error('Error fetching popup data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Port listen definition
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default server;


