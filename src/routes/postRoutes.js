const express = require('express');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware de autenticação
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.userId = decoded.id;
        next();
    });
};

// Criar post
router.post('/', authenticate, async (req, res) => {
    const { title, body } = req.body;
    try {
        const post = new Post({
            title,
            body,
            user: req.userId,
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'name email');
        res.json(posts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
