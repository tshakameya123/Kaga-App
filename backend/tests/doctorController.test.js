require('dotenv').config();
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList, changeAvailablity, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile } from '../controllers/doctorController';
import doctorModel from '../models/doctorModel';
import appointmentModel from '../models/AppointmentModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../models/doctorModel');
jest.mock('../models/appointmentModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Doctor Controller Tests', () => {
    
    describe('loginDoctor', () => {
        it('should log in doctor with valid credentials', async () => {
            const req = { body: { email: 'test@example.com', password: 'password123' }};
            const res = { json: jest.fn() };
            
            doctorModel.findOne.mockResolvedValue({ _id: 'doctorId', password: 'hashedPassword' });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fakeToken');
            
            await loginDoctor(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ success: true, token: 'fakeToken' });
        });

        it('should fail login with invalid credentials', async () => {
            const req = { body: { email: 'test@example.com', password: 'wrongPassword' }};
            const res = { json: jest.fn() };

            doctorModel.findOne.mockResolvedValue({ _id: 'doctorId', password: 'hashedPassword' });
            bcrypt.compare.mockResolvedValue(false);

            await loginDoctor(req, res);

            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
        });

        it('should handle errors during login', async () => {
            const req = { body: { email: 'test@example.com', password: 'password123' }};
            const res = { json: jest.fn() };
            
            doctorModel.findOne.mockRejectedValue(new Error('Database error'));
            
            await loginDoctor(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Database error' });
        });
    });

    describe('appointmentsDoctor', () => {
        it('should return doctor appointments successfully', async () => {
            const req = { body: { docId: 'doctorId' }};
            const res = { json: jest.fn() };
            
            appointmentModel.find.mockResolvedValue([{ _id: 'appointmentId' }]);

            await appointmentsDoctor(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ success: true, appointments: [{ _id: 'appointmentId' }] });
        });

        it('should handle errors when fetching appointments', async () => {
            const req = { body: { docId: 'doctorId' }};
            const res = { json: jest.fn() };
            
            appointmentModel.find.mockRejectedValue(new Error('Database error'));
            
            await appointmentsDoctor(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Database error' });
        });
    });

    // Additional test cases for appointmentCancel, appointmentComplete, doctorList, changeAvailablity, doctorProfile, updateDoctorProfile, doctorDashboard
});
