const cds = require('@sap/cds');
const express = require('express');
const jwt = require('jsonwebtoken');

cds.on('bootstrap', (app) => {
    // Explicit CORS headers - handles preflight (OPTIONS) before any other middleware
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        
        // Strip Authorization header so CAP's global dummy/jwt auth doesn't try to 
        // parse our custom legacy JWT token and throw 401 Unauthorized.
        // (Our custom Express routes don't use the header anyway)
        delete req.headers.authorization;
        
        next();
    });

    // URL Rewriting Middleware to maintain exact Angular frontend compatibility
    // The legacy Python app mapped POST /api/sponsor but CAP gives POST /api/sponsors
    app.use((req, res, next) => {
        // Rewrite singular to plural for CAP REST standard mappings
        
        // Sponsors
        if (req.path === '/api/sponsor') {
            req.url = req.url.replace('/api/sponsor', '/api/sponsors');
        } else if (req.path.match(/^ \/api\/sponsor\/[^\/]+$/)) {
            req.url = req.url.replace('/api/sponsor/', '/api/sponsors/');
        }
        
        // CROs
        if (req.path === '/api/cro') {
            req.url = req.url.replace('/api/cro', '/api/cros');
        } else if (req.path.match(/^\/api\/cro\/[^\/]+$/)) {
            req.url = req.url.replace('/api/cro/', '/api/cros/');
        }

        // Site Data
        if (req.path === '/api/site_data') {
            req.url = req.url.replace('/api/site_data', '/api/site_data');
        }

        next();
    });

    // Authentication and Login endpoints replacing Python Flask Logic
    app.use(express.json());


    app.post('/api/sendotp', async (req, res) => {
        const { username } = req.body;
        const db = await cds.connect.to('db');
        let user = await db.run(SELECT.one.from('kits.Users').where({ email: username }));
        
        if (!user) {
            // Auto seed the requested default admin user if the table is fresh from migration
            if (username.includes('jafar')) {
                await db.run(INSERT.into('kits.Users').entries({
                    user_id: cds.utils.uuid(),
                    email: username,
                    first_name: "kits",
                    last_name: "admin",
                    password: "Kits@123",
                    role: "admin",
                    status: "active"
                }));
                user = await db.run(SELECT.one.from('kits.Users').where({ email: username }));
            } else {
                return res.status(500).json({ message: "User not registered yet, please contact admin" });
            }
        }
        
        await db.run(UPDATE('kits.Users').set({ user_otp: 123456, otp_sent_time: new Date().toISOString() }).where({ email: username }));
        return res.status(201).json({ message: "OTP sent successfully." });
    });

    app.post('/api/login', async (req, res) => {
        const { username, password, otp } = req.body;
        const db = await cds.connect.to('db');
        const user = await db.run(SELECT.one.from('kits.Users').where({ email: username }));
        
        if (!user) return res.status(404).json({ message: "User does not exist" });
        if (user.user_otp != otp) return res.status(500).json({ message: "Invalid OTP" });
        if (user.password !== password) return res.status(500).json({ message: "Invalid password" });
        
        // Emulate PyJWT using the exact hardcoded secret from Python app.py
        const access_token = jwt.sign({ sub: user.user_id }, 'J@f@rU5m@9', { expiresIn: '24h' });
        const refresh_token = jwt.sign({ sub: user.user_id }, 'J@f@rU5m@9', { expiresIn: '24h' });
        
        res.status(200).json({
            access_token,
            refresh_token,
            role: user.role,
            user_id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        });
    });

    // GET user by ID (called by Angular after login to populate session)
    app.get('/api/user_actions/:id', async (req, res) => {
        try {
            const db = await cds.connect.to('db');
            const user = await db.run(SELECT.one.from('kits.Users').where({ user_id: req.params.id }));
            if (!user) return res.status(404).json({ message: "User not found" });
            return res.status(200).json(user);
        } catch (err) {
            console.error('GET /api/user_actions/:id error:', err);
            return res.status(500).json({ message: err.message });
        }
    });

    // PUT user by ID (update user profile)
    app.put('/api/user_actions/:id', async (req, res) => {
        try {
            const db = await cds.connect.to('db');
            await db.run(UPDATE('kits.Users').set(req.body).where({ user_id: req.params.id }));
            const user = await db.run(SELECT.one.from('kits.Users').where({ user_id: req.params.id }));
            return res.status(200).json(user);
        } catch (err) {
            console.error('PUT /api/user_actions/:id error:', err);
            return res.status(500).json({ message: err.message });
        }
    });

    // DELETE user by ID
    app.delete('/api/user_actions/:id', async (req, res) => {
        try {
            const db = await cds.connect.to('db');
            await db.run(DELETE.from('kits.Users').where({ user_id: req.params.id }));
            return res.status(200).json({ message: "User deleted" });
        } catch (err) {
            console.error('DELETE /api/user_actions/:id error:', err);
            return res.status(500).json({ message: err.message });
        }
    });

    // GET all users (user register listing)
    app.get('/api/user/register', async (req, res) => {
        try {
            const db = await cds.connect.to('db');
            const users = await db.run(SELECT.from('kits.Users'));
            return res.status(200).json(users);
        } catch (err) {
            console.error('GET /api/user/register error:', err);
            return res.status(500).json({ message: err.message });
        }
    });

    // POST create user
    app.post('/api/user/register', async (req, res) => {
        try {
            const db = await cds.connect.to('db');
            const entry = { ...req.body, user_id: cds.utils.uuid() };
            await db.run(INSERT.into('kits.Users').entries(entry));
            return res.status(201).json(entry);
        } catch (err) {
            console.error('POST /api/user/register error:', err);
            return res.status(500).json({ message: err.message });
        }
    });

    // PUT update user (register endpoint)
    app.put('/api/user/register', async (req, res) => {
        try {
            const db = await cds.connect.to('db');
            const { user_id, ...data } = req.body;
            await db.run(UPDATE('kits.Users').set(data).where({ user_id }));
            return res.status(200).json(req.body);
        } catch (err) {
            console.error('PUT /api/user/register error:', err);
            return res.status(500).json({ message: err.message });
        }
    });

    // Dashboard endpoint
    app.get('/api/dashboard', async (req, res) => {
        try {
            const db = await cds.connect.to('db');
            const sponsors = await db.run(SELECT.from('kits.Sponsor'));
            const cros = await db.run(SELECT.from('kits.Cro'));
            const protocols = await db.run(SELECT.from('kits.CroProtocol'));
            const sites = await db.run(SELECT.from('kits.SiteData'));
            return res.status(200).json({
                sponsor_count: sponsors.length,
                cro_count: cros.length,
                protocol_count: protocols.length,
                site_count: sites.length
            });
        } catch (err) {
            console.error('GET /api/dashboard error:', err);
            return res.status(500).json({ message: err.message });
        }
    });
});

module.exports = cds.server;
