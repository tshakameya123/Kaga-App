// MongoDB initialization script
// This script runs when the MongoDB container is first created

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'kh_app');

// Create application user with readWrite permissions
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE || 'kh_app'
    }
  ]
});

// Create indexes for better performance
// Users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

// Doctors collection
db.createCollection('doctors');
db.doctors.createIndex({ email: 1 }, { unique: true });
db.doctors.createIndex({ speciality: 1 });

// Appointments collection
db.createCollection('appointments');
db.appointments.createIndex({ userId: 1 });
db.appointments.createIndex({ docId: 1 });
db.appointments.createIndex({ slotDate: 1 });

// Messages collection
db.createCollection('messages');
db.messages.createIndex({ senderId: 1 });
db.messages.createIndex({ receiverId: 1 });
db.messages.createIndex({ createdAt: -1 });

// Notifications collection
db.createCollection('notifications');
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ createdAt: -1 });

print('✅ Database initialization completed successfully!');
