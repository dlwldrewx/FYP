const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },    // Name is required
    email: { type: String, required: true, unique: true }, // Email is required
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' } 
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await argon2.hash(this.password);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to verify password
userSchema.methods.comparePassword = async function (inputPassword) {
    try {
        return await argon2.verify(this.password, inputPassword);
    } catch (err) {
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);
