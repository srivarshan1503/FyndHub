import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"

const Register = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [college, setCollege] = useState('')
    const [error, setError] = useState('')
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await register({ name, email, password, college })
            navigate('/')
        } catch (error) {
            setError("Registration failed. Please try again.")
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold text-blue-700 mb-2 text-center">
                    Create Account
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Join WhereIsMine and help your campus
                </p>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your college email"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                        <select
                            required
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select your college</option>
                            <option value="CEG">CEG</option>
                            <option value="ACT">ACT</option>
                            <option value="SAP">SAP</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition mt-2"
                    >
                        Create Account
                    </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-700 font-medium hover:underline">Login</Link>
                </p>
            </div>
        </div>
    )
}

export default Register