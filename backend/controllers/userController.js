import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import validator from "validator";
import crypto from 'crypto';
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/AppointmentModel.js";
import { v2 as cloudinary } from 'cloudinary';
import stripe from "stripe";
import razorpay from 'razorpay';
import { sendAppointmentConfirmation, sendCancellationAlert, sendNewAppointmentToDoctor, sendRescheduleNotification } from './notificationController.js';
import { sendPasswordResetEmail } from '../config/email.js';

// // Gateway Initialize
// const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
// const razorpayInstance = new razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

// JWT Token generation with expiration
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// Strong password validation
const isStrongPassword = (password) => {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&#^()_+=\-[\]{}|;:'",.<>/\\`~]{8,}$/;
    return passwordRegex.test(password);
};

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing Details' })
        }

        // Validate name (2-100 chars, letters and spaces only)
        const nameRegex = /^[a-zA-Z\s\-']{2,100}$/;
        if (!nameRegex.test(name.trim())) {
            return res.status(400).json({ success: false, message: "Please enter a valid name (2-100 characters)" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (!isStrongPassword(password)) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 8 characters with uppercase, lowercase, and number" 
            })
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: normalizedEmail })
        if (existingUser) {
            return res.status(409).json({ success: false, message: "An account with this email already exists. Please login instead." })
        }

        // hashing user password with higher cost factor
        const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 for better security
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name: validator.escape(name.trim()), // Sanitize name
            email: normalizedEmail,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = generateToken(user._id);

        res.status(201).json({ success: true, token })

    } catch (error) {
        console.error('Registration error:', error)
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "An account with this email already exists. Please login instead." })
        }
        
        res.status(500).json({ success: false, message: "Registration failed. Please try again." })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" })
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail })

        if (!user) {
            // Use generic message to prevent user enumeration
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = generateToken(user._id);
            res.status(200).json({ success: true, token })
        }
        else {
            // Use generic message to prevent user enumeration
            res.status(401).json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ success: false, message: "Login failed. Please try again." })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Check if userId is provided
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not provided' });
        }

        const userData = await userModel.findById(userId).select('-password');

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, userData });
    } catch (error) {
        console.log('Error in getProfile:', error);
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Send confirmation notification to patient
        try {
            await sendAppointmentConfirmation(newAppointment);
            // Also notify doctor about new booking
            await sendNewAppointmentToDoctor(newAppointment);
        } catch (notifError) {
            console.error('Failed to send confirmation notification:', notifError);
        }

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Send cancellation alerts to doctor and admin
        try {
            await sendCancellationAlert(appointmentData, 'patient');
        } catch (notifError) {
            console.error('Failed to send cancellation notification:', notifError);
        }

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Function to reschedule an appointment
const rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentId, newDate, newTime } = req.body;

        // Find the appointment to be rescheduled
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment not found or already cancelled' });
        }

        // Store old date and time for notification
        const oldDate = appointmentData.slotDate;
        const oldTime = appointmentData.slotTime;

        // Free up the old slot from doctor's booked slots
        const doctor = await doctorModel.findById(appointmentData.docId);
        if (doctor && doctor.slots_booked && doctor.slots_booked[oldDate]) {
            doctor.slots_booked[oldDate] = doctor.slots_booked[oldDate].filter(
                slot => slot !== oldTime
            );
            doctor.markModified('slots_booked');
        }

        // Book the new slot
        if (!doctor.slots_booked[newDate]) {
            doctor.slots_booked[newDate] = [];
        }
        doctor.slots_booked[newDate].push(newTime);
        doctor.markModified('slots_booked');
        await doctor.save();

        // Update the appointment's date and time
        appointmentData.slotDate = newDate;
        appointmentData.slotTime = newTime;
        await appointmentData.save();

        // Send reschedule notifications to doctor, patient, and admin
        try {
            // Populate the appointment data for notification
            const populatedAppointment = await appointmentModel.findById(appointmentId)
                .populate('userId', 'name email')
                .populate('docId', 'name email');
            
            // Add docData and userData for notification compatibility
            populatedAppointment.docData = populatedAppointment.docId;
            populatedAppointment.userData = populatedAppointment.userId;
            
            await sendRescheduleNotification(populatedAppointment, oldDate, oldTime, 'patient');
        } catch (notifError) {
            console.error('Error sending reschedule notification:', notifError);
            // Don't fail the reschedule if notification fails
        }

        res.json({ success: true, message: 'Appointment rescheduled successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// ============================================
// PASSWORD RECOVERY & ACCOUNT MANAGEMENT
// ============================================

// Generate password reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// API to request password reset (Forgot Password)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        
        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email' });
        }

        const user = await userModel.findOne({ email: normalizedEmail });

        // Always return success to prevent user enumeration
        if (!user) {
            return res.json({ 
                success: true, 
                message: 'If an account with this email exists, a password reset link has been sent.' 
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save token and expiry to user (token expires in 1 hour)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // In production, you would send an email with the reset link
        // For now, we'll return the token (for development/testing)
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        console.log(`Password reset requested for ${normalizedEmail}`);
        console.log(`Reset URL: ${resetUrl}`);

        // Send password reset email
        try {
            await sendPasswordResetEmail(user.email, resetUrl, user.name);
            console.log(`Password reset email sent to ${normalizedEmail}`);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Don't fail the request if email fails - user can request again
        }

        res.json({ 
            success: true, 
            message: 'If an account with this email exists, a password reset link has been sent.',
            // Include token in development mode only (for testing without email)
            ...(process.env.NODE_ENV !== 'production' && { resetToken, resetUrl })
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Failed to process request. Please try again.' });
    }
};

// API to reset password using token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }

        // Validate password strength
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
            });
        }

        // Hash the provided token to compare with stored hash
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const user = await userModel.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password reset token is invalid or has expired' 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ success: true, message: 'Password has been reset successfully. You can now login with your new password.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
    }
};

// API to verify reset token (check if token is valid before showing reset form)
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await userModel.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password reset token is invalid or has expired' 
            });
        }

        res.json({ success: true, message: 'Token is valid' });

    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify token' });
    }
};

// API to change password (for logged in users)
const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
        }

        // Validate new password strength
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 8 characters with uppercase, lowercase, and number' 
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ success: false, message: 'New password must be different from current password' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password. Please try again.' });
    }
};

// API to delete account
const deleteAccount = async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required to delete account' });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password is incorrect' });
        }

        // Cancel all pending appointments
        await appointmentModel.updateMany(
            { userId: userId, cancelled: false, isCompleted: false },
            { cancelled: true }
        );

        // Delete user
        await userModel.findByIdAndDelete(userId);

        res.json({ success: true, message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete account. Please try again.' });
    }
};



export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
    rescheduleAppointment,
    forgotPassword,
    resetPassword,
    verifyResetToken,
    changePassword,
    deleteAccount
};
