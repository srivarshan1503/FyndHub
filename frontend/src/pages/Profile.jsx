import { useState, useEffect } from "react";
import { getMyPosts } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            const response = await getMyPosts();
            console.log('My posts:', response.data)
            setPosts(response.data);
        } catch (error) {
            console.log('Error fetching posts:', error.response?.data)
            setPosts([]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-2xl font-semibold text-blue-700">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            <p className="text-sm text-gray-500">{user?.college}</p>
                        </div>
                        <div className="ml-auto text-center">
                            <p className="text-2xl font-semibold text-blue-700">{user?.reputation_score || 0}</p>
                            <p className="text-xs text-gray-500">Reputation Score</p>
                        </div>
                    </div>
                </div>

                {/* My Posts */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">My Posts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.length === 0 ? (
                            <p className="text-gray-500 text-sm col-span-3 text-center">No posts yet</p>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                    <div className={`h-32 flex items-center justify-center ${post.type === 'lost' ? 'bg-red-50' : 'bg-green-50'}`}>
                                        {post.image_url ? (
                                            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-5xl">📦</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${post.type === 'lost'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                                        </span>
                                        <h3 className="text-sm font-semibold text-gray-800 mt-2">{post.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{post.location_name}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
};

export default Profile;