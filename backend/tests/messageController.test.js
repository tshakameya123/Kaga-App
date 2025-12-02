require('dotenv').config();
import { createMessage } from '../controllers/messageController';
import messageModel from '../models/messageModel';
import validator from 'validator';

jest.mock('../models/messageModel');
jest.mock('validator');

describe('Message Controller', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  describe('createMessage', () => {
    it('should return an error if details are missing', async () => {
      const req = { body: { name: '', email: '', subject: '', message: '' } };
      const res = { json: jest.fn() };

      await createMessage(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Missing Details' });
    });

    it('should return an error if email is invalid', async () => {
      const req = { body: { name: 'John', email: 'invalid-email', subject: 'Hello', message: 'Test' } };
      const res = { json: jest.fn() };
      validator.isEmail.mockReturnValue(false);

      await createMessage(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Please enter a valid email' });
    });
  });
});
