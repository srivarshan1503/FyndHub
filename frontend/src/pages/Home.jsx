import { useState, useEffect } from "react"
import { getPosts, searchPosts } from "../services/api"
import { Link } from "react-router-dom"
import { useAuth } from '../context/AuthContext'

const Home = () => {

    const [posts, setPosts] = useState([])
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [error, setError] = useState('')
    const { user } = useAuth()

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const response = await getPosts();
            setPosts(response.data)
        } catch (error) {
            setError(error)
        }
    }

    useEffect(() => {
        if (filter === 'all') {
            fetchPosts()
        } else {
            handleSearch()
        }
    }, [filter])

    const handleSearch = async () => {
        try {
            const res = await searchPosts({
                keyword: search,
                type: filter === 'all' || filter === 'electronics' || filter === 'accessories' || filter === 'books' ? '' : filter,
                category: filter === 'electronics' || filter === 'accessories' || filter === 'books' ? filter : ''
            })
            setPosts(res.data)
        } catch (error) {
            setPosts([])
        }
    }

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-blue-600 px-6 py-12 text-center">
                <h1 className="text-white text-2xl font-semibold mb-2">
                    Find what you lost. Return what you found.
                </h1>
                <p className="text-blue-100 text-sm mb-6">
                    Search across all lost & found posts on campus
                </p>

                {/* Search Bar */}
                <div className="flex max-w-xl mx-auto gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by item, location, color..."
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                    >
                        Search
                    </button>
                </div>

                {/* Filter Pills */}
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                    {['all', 'lost', 'found', 'electronics', 'accessories', 'books'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${filter === f
                                ? 'bg-white text-blue-700'
                                : 'bg-blue-600 text-white hover:bg-blue-500'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Section */}
            <div className="px-6 py-8 bg-gray-100 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Posts</h2>
                    {user && (
                        <Link to="/create-post" className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
                            + Report Item
                        </Link>
                    )}
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 ">
                    {posts.length === 0 ? (
                        <p className="text-gray-500 text-sm col-span-3 text-center mt-10">No posts found</p>
                    ) : (
                        posts.map((post) => (
                            <Link to={`/posts/${post.id}`} key={post.id}>
                                <div className="bg-white rounded-2xl hover:shadow-md transition overflow-hidden shadow-[1_1_20px_rgba(59, 130, 246, 0.8)]">
                                    {/* Image or placeholder */}
                                    <div className={`h-40 flex items-center justify-center ${post.type === 'lost' ? 'bg-red-50' : 'bg-green-50'}`}>

                                        {post.image_url ? (
                                            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-5xl">No Image</span>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-2">
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
                                        <h3 className="text-sm font-semibold text-gray-800 mb-1">{post.title}</h3>
                                        <p className="text-xs text-gray-500 mb-3">{post.description}</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-blue-600">@ {post.location_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>



        </div>
    )
}


export default Home
