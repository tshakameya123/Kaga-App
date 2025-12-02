import axios from 'axios';
import messageModel from "../models/messageModel.js";
import validator from 'validator';


// Function to create a message
const createMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            // Change success: true to success: false here
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const newMessage = new messageModel({ name, email, subject, message });
        await newMessage.save();

        res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// Function to send a message from the client-side
const sendMessage = async (messageData) => {
    try {
        const response = await axios.post('/api/messages', messageData);

        // Check and log the success message
        if (response && response.data) {
            console.log(response.data.message); // Display success message
        } else {
            console.log("No response data received.");
        }
    } catch (error) {
        console.error("Error sending message:", error);
        
        // Handle the error response
        if (error.response && error.response.data) {
            console.log(error.response.data.message); // Log the error message from the server
        } else {
            console.log("Network or server error occurred.");
        }
    }
};

// Function to get messages
const getMessages = async (req, res) => {
    try {
        const messages = await messageModel.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function to get a message by ID
const getMessageById = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await messageModel.findById(messageId);

        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }

        res.json({ success: true, message });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function to update a message
const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const updatedMessage = await messageModel.findByIdAndUpdate(
            messageId,
            { name, email, subject, message },
            { new: true, runValidators: true }
        );

        if (!updatedMessage) {
            return res.json({ success: false, message: "Message not found" });
        }

        res.json({ success: true, message: "Message updated successfully!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function to delete a message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const deletedMessage = await messageModel.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.json({ success: false, message: "Message not found" });
        }

        res.json({ success: true, message: "Message deleted successfully!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Exporting all functions
export {
    createMessage,
    getMessages,
    getMessageById,
    updateMessage,
    deleteMessage,
    sendMessage // Exporting sendMessage function for client-side usage
};
