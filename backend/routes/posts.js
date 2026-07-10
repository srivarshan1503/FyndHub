const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')
const { createPost, getPosts, getPostById, searchPosts, getMyPosts, getNearbyMatches, getSimilarPosts } = require('../controllers/postController')

router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/my-posts', authMiddleware, getMyPosts);
router.get('/nearby', getNearbyMatches);
router.get('/:id/similar', getSimilarPosts)
router.get('/:id', getPostById);

router.post('/', authMiddleware, upload.single('image'), createPost)

module.exports = router

