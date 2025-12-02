import jwt from "jsonwebtoken";
import appointmentModel from "../models/AppointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcryptjs';
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        
        // Fetch fresh user data for each appointment
        const appointmentsWithFreshData = await Promise.all(
            appointments.map(async (appointment) => {
                const appointmentObj = appointment.toObject()
                
                // Get fresh user data
                const freshUserData = await userModel.findById(appointment.userId).select('-password')
                if (freshUserData) {
                    appointmentObj.userData = {
                        ...appointmentObj.userData,
                        image: freshUserData.image,
                        name: freshUserData.name,
                        email: freshUserData.email,
                        phone: freshUserData.phone,
                        dob: freshUserData.dob,
                        gender: freshUserData.gender
                    }
                }
                
                return appointmentObj
            })
        )
        
        res.json({ success: true, appointments: appointmentsWithFreshData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for deleting appointment permanently
const deleteAppointment = async (req, res) => {
    try {

        const { appointmentId } = req.body
        
        // Find the appointment to get doctor and slot info
        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // Release the doctor slot if appointment is not cancelled
        if (!appointmentData.cancelled) {
            const { docId, slotDate, slotTime } = appointmentData
            const doctorData = await doctorModel.findById(docId)
            
            if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
                let slots_booked = doctorData.slots_booked
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
                await doctorModel.findByIdAndUpdate(docId, { slots_booked })
            }
        }

        // Delete the appointment permanently
        await appointmentModel.findByIdAndDelete(appointmentId)

        res.json({ success: true, message: 'Appointment Deleted Permanently' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        console.log("Adding doctor:", name, email);

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // Check if image file exists
        if (!imageFile) {
            return res.json({ success: false, message: "Please upload a doctor image" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // Check if doctor with email already exists
        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.json({ success: false, message: "A doctor with this email already exists" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        console.log("Uploading image to Cloudinary...");
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { 
            resource_type: "image",
            timestamp: Math.round(Date.now() / 1000)  // Fresh timestamp
        })
        const imageUrl = imageUpload.secure_url
        console.log("Image uploaded:", imageUrl);

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        console.log("Doctor saved successfully");
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log("Error adding doctor:", error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete a doctor
const deleteDoctor = async (req, res) => {
    try {
        const { docId } = req.body

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" })
        }

        // Find the doctor first
        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        // Delete any appointments associated with this doctor
        await appointmentModel.deleteMany({ docId })

        // Delete the doctor
        await doctorModel.findByIdAndDelete(docId)

        console.log(`Doctor deleted: ${doctor.name} (${doctor.email})`)
        res.json({ success: true, message: 'Doctor deleted successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to edit/update a doctor
const editDoctor = async (req, res) => {
    try {
        const { docId, name, email, speciality, degree, experience, about, fees, address, available } = req.body
        const imageFile = req.file

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" })
        }

        // Find the doctor
        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        // Build update object with only provided fields
        const updateData = {}
        if (name) updateData.name = name
        if (email) updateData.email = email
        if (speciality) updateData.speciality = speciality
        if (degree) updateData.degree = degree
        if (experience) updateData.experience = experience
        if (about) updateData.about = about
        if (fees) updateData.fees = fees
        if (address) updateData.address = JSON.parse(address)
        if (typeof available !== 'undefined') updateData.available = available

        // Upload new image if provided
        if (imageFile) {
            console.log("Uploading new image to Cloudinary...");
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { 
                resource_type: "image",
                timestamp: Math.round(Date.now() / 1000)
            })
            updateData.image = imageUpload.secure_url
            console.log("New image uploaded:", updateData.image);
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)

        console.log(`Doctor updated: ${name || doctor.name}`)
        res.json({ success: true, message: 'Doctor updated successfully' })

    } catch (error) {
        console.log("Error updating doctor:", error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all patients/users list for admin panel
const allPatients = async (req, res) => {
    try {
        const patients = await userModel.find({}).select('-password')
        res.json({ success: true, patients })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete a patient/user
const deletePatient = async (req, res) => {
    try {
        const { userId } = req.body

        if (!userId) {
            return res.json({ success: false, message: "User ID is required" })
        }

        // Find the user first
        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        // Delete any appointments associated with this user
        await appointmentModel.deleteMany({ userId })

        // Delete the user
        await userModel.findByIdAndDelete(userId)

        console.log(`User deleted: ${user.name} (${user.email})`)
        res.json({ success: true, message: 'Patient deleted successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    deleteAppointment,
    addDoctor,
    allDoctors,
    allPatients,
    deletePatient,
    deleteDoctor,
    editDoctor,
    adminDashboard
}