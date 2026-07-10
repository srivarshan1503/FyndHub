import { useState } from "react"
import { createPost } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import MapPicker from "../components/MapPicker"

const CreatePost = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        title: '', type: 'lost', category: '',
        color: '', brand: '', description: '',
        location_name: ''
    })
    const [image, setImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [coordinates, setCoordinates] = useState(null)

    // if (!user) {
    //     navigate('/login')
    //     return null;
    // }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        console.log('Form submitted', formData)
        setError('')
        try {
            const data = new FormData()
            data.append('title', formData.title)
            data.append('type', formData.type)
            data.append('category', formData.category)
            data.append('color', formData.color)
            data.append('brand', formData.brand)
            data.append('description', formData.description)
            data.append('location_name', formData.location_name)
            data.append('latitude', coordinates.lat)
            data.append('longitude', coordinates.lng)
            console.log('image file: ', image, image?.type, image?.name);
            if (image) {
                data.append('image', image, image.name)
            }
            console.log('Token:', localStorage.getItem('token'))
            const res = await createPost(data)
            console.log('Post created', res.data)
            navigate('/')
        } catch (error) {
            console.log('Error:', error.response?.data)
        } finally {
            setLoading(false)
        }
    }

    const handleLocationSelect = (latlng) => {
        setCoordinates(latlng)
        console.log('Selecting coordinates:', latlng)
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-2xl font-semibold text-blue-700 mb-6">Report an Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-28" rows="3" required />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <input type="text" name="location_name" value={formData.location_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Pin your location on map
                        </label>
                        <p className="text-xs text-gray-400 mb-1">Click on the map to drop a pin</p>
                        <MapPicker onLocationSelect={handleLocationSelect} />
                        {coordinates && (
                            <p className="text-xs text-green-600 mt-1">
                                📍 Location selected: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                            <option value="">Select Category</option>
                            <option value="electronics">Electronics</option>
                            <option value="accessories">Accessories</option>
                            <option value="books">Books</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Color</label>
                        <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Brand</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Image (Highly Recommended)</label>
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700" />
                    </div>

                    <button type="submit" disabled={loading} className={loading
                        ? "w-full bg-blue-400 text-white py-2.5 rounded-lg text-sm font-medium cursor-not-allowed mt-2"
                        : "w-full bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition mt-2"
                    }>
                        {loading ? 'Uploading...' : 'Post'}
                    </button>
                </form>
            </div>
        </div>
    )
}


export default CreatePost


