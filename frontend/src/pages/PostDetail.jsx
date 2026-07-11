import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { getPostById, getNearbyMatches, getSimilarPosts } from "../services/api"
import { io } from "socket.io-client"
import { Link } from "react-router-dom"

const socket = io("http://localhost:5000")

const PostDetail = () => {
    const { id } = useParams()
    const [post, setPost] = useState(null)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const messagesEndRef = useRef(null)
    const [similarPosts, setSimilarPosts] = useState([])
    const [nearbyMatches, setNearbyMatches] = useState([])

    const fetchNearbyMatches = async (post) => {
        try {
            console.log('latitude:', post.latitude, 'longitude:', post.longitude)
            if (post.latitude && post.longitude) {
                const res = await getNearbyMatches({
                    latitude: post.latitude,
                    longitude: post.longitude,
                    type: post.type
                })
                console.log('Nearby matches:', res.data)
                setNearbyMatches(res.data)

                const similarRes = await getSimilarPosts(id)
                console.log('Similar posts:', similarRes.data)
                setSimilarPosts(similarRes.data)
            } else {
                console.log('No coordinates found in post')
            }
        } catch (error) {
            console.log('Error:', error)
        }
    }

    useEffect(() => {
        fetchPost()
        socket.emit('join_room', id)
        socket.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data])
        })
        return () => {
            socket.off('receive_message')
        }
    }, [id])

    const fetchPost = async () => {
        try {
            const response = await getPostById(id)
            setPost(response.data)
            fetchNearbyMatches(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    const sendMessage = () => {
        if (!message.trim()) return
        socket.emit('send_message', {
            postId: id, message
        })
        setMessage('')
    }

    if (!post) return <p className="text-center mt-10 text-gray-500">Post not found</p>

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">


                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    <div className={`h-56 flex items-center justify-center ${post.type === 'lost' ? 'bg-red-50' : 'bg-green-50'}`}>
                        {post.image_url ? (
                            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-7xl">📦</span>
                        )}
                    </div>

                    {/* Details */}
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-3">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${post.type === 'lost'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                                }`}>
                                {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(post.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800 mb-4">{post.title}</h2>

                        <div className="space-y-2 mb-4">
                            {post.category && (
                                <div className="flex gap-2">
                                    <span className="text-sm font-medium text-gray-500 w-24">Category</span>
                                    <span className="text-sm text-gray-700">{post.category}</span>
                                </div>
                            )}
                            {post.color && (
                                <div className="flex gap-2">
                                    <span className="text-sm font-medium text-gray-500 w-24">Color</span>
                                    <span className="text-sm text-gray-700">{post.color}</span>
                                </div>
                            )}
                            {post.brand && (
                                <div className="flex gap-2">
                                    <span className="text-sm font-medium text-gray-500 w-24">Brand</span>
                                    <span className="text-sm text-gray-700">{post.brand}</span>
                                </div>
                            )}
                            {post.location_name && (
                                <div className="flex gap-2">
                                    <span className="text-sm font-medium text-gray-500 w-24">Location</span>
                                    <span className="text-sm text-blue-600">{post.location_name}</span>
                                </div>
                            )}
                        </div>

                        {post.description && (
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{post.description}</p>
                            </div>
                        )}
                    </div>
                </div>


                <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-gray-800">Anonymous Chat</h3>
                        <p className="text-xs text-gray-400">Chat anonymously with the poster</p>
                    </div>


                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        {messages.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center mt-10">
                                No messages yet. Start the conversation!
                            </p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.senderId === socket.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.senderId === socket.id
                                        ? 'bg-blue-700 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>


                    <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
                        >
                            Send
                        </button>
                    </div>
                </div>

            </div>
            {similarPosts.length > 0 && (
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                        AI Similar Items
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        {similarPosts.map((match) => (
                            <Link to={`/posts/${match.id}`} key={match.id}>
                                <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                                    <div className={`h-24 rounded-lg flex items-center justify-center mb-3 ${match.type === 'lost' ? 'bg-red-50' : 'bg-green-50'
                                        }`}>
                                        {match.image_url ? (
                                            <img src={match.image_url} alt={match.title} className="h-full w-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-4xl">📦</span>
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${match.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {match.type.charAt(0).toUpperCase() + match.type.slice(1)}
                                    </span>
                                    <h4 className="text-sm font-semibold text-gray-800 mt-2">{match.title}</h4>
                                    <p className="text-xs text-blue-600 mt-1">📍 {match.location_name}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {Math.round(match.similarity * 100)}% match
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {nearbyMatches.length > 0 && (
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                        Nearby {post.type === 'lost' ? 'Found' : 'Lost'} Items
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        {nearbyMatches.map((match) => (
                            <Link to={`/posts/${match.id}`} key={match.id}>
                                <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                                    <div className={`h-24 rounded-lg flex items-center justify-center mb-3 ${match.type === 'lost' ? 'bg-red-50' : 'bg-green-50'
                                        }`}>
                                        {match.image_url ? (
                                            <img src={match.image_url} alt={match.title} className="h-full w-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-4xl">📦</span>
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${match.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {match.type.charAt(0).toUpperCase() + match.type.slice(1)}
                                    </span>
                                    <h4 className="text-sm font-semibold text-gray-800 mt-2">{match.title}</h4>
                                    <p className="text-xs text-blue-600 mt-1">📍 {match.location_name}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {Math.round(match.distance)}m away
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}


export default PostDetail
