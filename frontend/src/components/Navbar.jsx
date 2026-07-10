import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useContext } from 'react'

const Navbar = () => {
    const { user, logoutUser } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logoutUser()
        navigate("/login")
    }

    return (
        <nav className="bg-blue-700 px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">FyndHub</span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6">
                <Link to="/" className="text-white text-sm opacity-90 hover:opacity-100">Home</Link>
                {user ? (
                    <>
                        <Link to="/create-post" className="text-white text-sm opacity-90 hover:opacity-100">Create Post</Link>
                        <Link to="/profile" className="text-white text-sm opacity-90 hover:opacity-100">My Posts</Link>
                        <button
                            onClick={handleLogout}
                            className="bg-white text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full hover:bg-blue-50 transition"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-white text-sm opacity-90 hover:opacity-100">
                            Login
                        </Link>
                        <Link to="/register" className="bg-white text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full hover:bg-blue-50 transition">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar