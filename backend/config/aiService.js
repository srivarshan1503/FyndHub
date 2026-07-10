const axios = require('axios');
const FormData = require('form-data');

async function getImageEmbedding(imageUrl) {
    try {
        console.log('Downloading image from:', imageUrl)
        const imageResponse = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'arraybuffer',
            timeout: 10000
        })
        console.log('Image downloaded:', imageResponse.data)
        console.log('Image downloaded, size:', imageResponse.data.byteLength)

        const buffer = Buffer.from(imageResponse.data)
        const formData = new FormData()
        formData.append('file', buffer, {
            filename: 'image.jpg',
            contentType: imageResponse.headers['content-type'] || 'image/jpeg'
        })

        const response = await axios.post('http://localhost:8000/embed', formData, {
            headers: formData.getHeaders(),
            timeout: 30000
        });
        console.log('Embedding received:', response.data)
        return response.data.embedding;
    } catch (error) {
        console.log('AI service error', error.message);
        return null;
    }
}

async function findSimilarPosts(embedding, pool) {
    try {
        const query = `SELECT * FROM posts WHERE embedding IS NOT NULL`;
        const result = await pool.query(query);
        const post = result.rows

        const similarPosts = []
        for (let i = 0; i < post.length; i++) {
            const similarity = await axios.post('http://localhost:8000/similarity', {
                embedding1: embedding,
                embedding2: post[i].embedding

            });
            if (similarity.data.similarity > 0.7) {
                similarPosts.push({ ...post[i], similarity: similarity.data.similarity });
            }
        }
        return similarPosts.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
        console.log('AI service error', error.message);
        return [];
    }
}


module.exports = { getImageEmbedding, findSimilarPosts }



