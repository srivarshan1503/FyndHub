const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { getImageEmbedding, findSimilarPosts } = require('../config/aiService');
const { sendNotification } = require('../config/notificcations');
const axios = require('axios');
async function reverseGeocode(lat, lng) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': 'whereismine-app' } }
        )
        return response.data.display_name
    } catch (error) {
        return null
    }
}

async function createPost(req, res) {
    try {
        const { title, type, category, color, brand, description, location_name } = req.body;
        const { latitude, longitude } = req.body;
        const user_id = req.user.id;

        let final_location_name = location_name;
        if (latitude && longitude) {
            const geocoded = await reverseGeocode(latitude, longitude);
            if (geocoded) final_location_name = geocoded;
        }

        let image_url = null
        if (req.file) {
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                { folder: 'whereismine', timeout: 60000 }
            )
            image_url = result.secure_url
        }

        let embedding = null;
        let similarPosts = [];

        if (image_url) {
            console.log('Getting embedding for:', image_url)
            embedding = await getImageEmbedding(image_url);
            console.log('Embedding Result:', embedding)
            if (embedding) {
                similarPosts = await findSimilarPosts(embedding, pool);
                console.log('Similar posts:', similarPosts)
            }
        }
        const query = `INSERT INTO posts (title,type,category,color,brand,description,location_name,image_url,user_id,embedding,location_point) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,ST_SetSRID(ST_MakePoint($11,$12),4326)) RETURNING *`;
        const result1 = await pool.query(query, [title, type, category, color, brand, description, location_name, image_url, user_id, embedding, longitude, latitude]);

        for (const similarPost of similarPosts) {
            const ownerResult = await pool.query('SELECT * FROM users WHERE id = $1', [similarPost.user_id])
            const owner = ownerResult.rows[0]
            if (owner.fcm_token) {
                await sendNotification(
                    owner.fcm_token,
                    'Possible match found!',
                    `Someone posted about a ${title} that might be yours!`
                )
            }
        }
        res.status(201).json({ post: result1.rows[0], similarPosts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

async function getPosts(req, res) {
    try {
        const query = `SELECT * FROM posts WHERE status = 'active' ORDER BY created_at DESC`;
        const result = await pool.query(query);
        if (result.rows.length == 0) {
            return res.status(404).json({ message: "No posts found" });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getPostById(req, res) {
    try {
        const id = req.params.id;
        const query = `SELECT *, 
            ST_X(location_point::geometry) as longitude, 
            ST_Y(location_point::geometry) as latitude  FROM posts WHERE id = $1`;
        const result = await pool.query(query, [id]);
        if (result.rows.length == 0) {
            return res.status(404).json({ message: "No posts found" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function searchPosts(req, res) {
    try {
        const { type, category, keyword } = req.query;
        let query = `SELECT * FROM posts WHERE status = 'active'`;
        let count = 1;
        let params = [];
        if (type) {
            query += ` AND type = $${count}`;
            params.push(type);
            count++;
        }
        if (category) {
            query += ` AND category = $${count}`;
            params.push(category);
            count++;
        }
        if (keyword) {
            query += ` AND (title ILIKE $${count} OR description ILIKE $${count})`;
            params.push(`%${keyword}%`);
            count++;
        }
        query += ` ORDER BY created_at DESC`;
        const result = await pool.query(query, params);
        if (result.rows.length == 0) {
            return res.status(200).json({ message: "No posts found" });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getMyPosts(req, res) {
    try {
        const user_id = req.user.id;
        const query = `SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [user_id]);
        if (result.rows.length == 0) {
            return res.status(404).json({ message: "No posts found" });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getNearbyMatches(req, res) {
    try {
        const { latitude, longitude, type } = req.query

        const oppositeType = type === 'lost' ? 'found' : 'lost'

        const query = `
            SELECT *, 
            ST_Distance(
                location_point::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
            ) as distance
            FROM posts 
            WHERE status = 'active'
            AND type = $3
            AND location_point IS NOT NULL
            AND ST_DWithin(
                location_point::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                500
            )
            ORDER BY distance ASC
        `
        const result = await pool.query(query, [longitude, latitude, oppositeType])
        res.status(200).json(result.rows)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}

async function getSimilarPosts(req, res) {
    try {
        const { id } = req.params
        const post = await pool.query('SELECT * FROM posts WHERE id = $1', [id])
        if (post.rows.length === 0) return res.status(404).json({ message: 'Post not found' })

        const embedding = post.rows[0].embedding
        if (!embedding) return res.status(200).json([])

        const similarPosts = await findSimilarPosts(embedding, pool)
        const filtered = similarPosts.filter(p => p.id !== parseInt(id))
        res.status(200).json(filtered)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}

module.exports = { createPost, getPosts, getPostById, searchPosts, getMyPosts, reverseGeocode, getNearbyMatches, getSimilarPosts };



