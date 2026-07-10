const firebase_admin = require('./firebase')

async function sendNotification(fcmToken, title, body) {
    try {
        const message = {
            notification: {
                title: title,
                body: body
            },
            token: fcmToken
        }
        const result = await firebase_admin.messaging().send(message)
        console.log('Notification sent:', result)
        return result
    } catch (error) {
        console.log('Notification error:', error.message)
        return null
    }
}

module.exports = { sendNotification }