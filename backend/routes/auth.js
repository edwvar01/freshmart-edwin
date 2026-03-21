const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Seed default admin if none exists
async function seedAdmin() {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const defaultAdmin = new User({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            await defaultAdmin.save();
            console.log('Default admin seeded: admin / admin123');
        }
    } catch (err) {
        console.error('Error seeding admin', err);
    }
}
seedAdmin();

router.post('/signup', async (req, res) => {
    try {
        const { username, password, type } = req.body;
        const roleQuery = type === 'customer' ? 'customer' : type;

        const existingUser = await User.findOne({ username, role: roleQuery });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Account already exists' });
        }

        const user = new User({ username, password, role: roleQuery });
        await user.save();

        return res.json({ success: true, message: 'Account created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password, type } = req.body;
        const roleQuery = type === 'customer' ? 'customer' : type;

        const user = await User.findOne({ username, role: roleQuery });
        if (user && user.password === password) {
             return res.json({ success: true, token: `mock-${roleQuery}-token`, role: roleQuery, name: username });
        }

        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
