import express from 'express';
import {
    createMessage,
    getMessages,
    getMessageById,
    updateMessage,
    deleteMessage
} from "../controllers/messageController.js"; 
import validator from 'validator';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Contact messages and inquiries
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *                 description: The sender's ID
 *               content:
 *                 type: string
 *                 description: The content of the message
 *     responses:
 *       201:
 *         description: Message created successfully
 *       400:
 *         description: Bad request
 */
router.post('/messages', createMessage);      

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Get all messages
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: List of messages retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/messages', getMessages);       

/**
 * @swagger
 * /messages/{messageId}:
 *   get:
 *     summary: Get a message by ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to retrieve
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *       404:
 *         description: Message not found
 */
router.get('/messages/:messageId', getMessageById); 

/**
 * @swagger
 * /messages/{messageId}:
 *   put:
 *     summary: Update a message by ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated content of the message
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       404:
 *         description: Message not found
 *       400:
 *         description: Bad request
 */
router.put('/messages/:messageId', updateMessage);  

/**
 * @swagger
 * /messages/{messageId}:
 *   delete:
 *     summary: Delete a message by ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */
router.delete('/messages/:messageId', deleteMessage); 

export default router;
