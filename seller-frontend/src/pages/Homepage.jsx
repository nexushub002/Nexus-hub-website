import React from 'react'
import Navbar from '../compo/Navbar'
import { useSeller } from '../context/SellerContext'
import { useNavigate } from 'react-router-dom'

const Homepage = () => {
    const { isAuthenticated } = useSeller()
    const navigate = useNavigate()

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/seller/dashboard')
        } else {
            navigate('/seller-signup')
        }
    }

    const handleLogin = () => {
        navigate('/seller-signin')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                    Grow Your Business on
                                    <span className="text-yellow-300 block">NexusHub</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                                    Join India's fastest-growing B2B marketplace and reach millions of buyers across the country
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={handleGetStarted}
                                    className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                >
                                    {isAuthenticated ? 'Go to Dashboard' : 'Start Selling Now'}
                                </button>
                                {!isAuthenticated && (
                                    <button 
                                        onClick={handleLogin}
                                        className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200"
                                    >
                                        Login
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center space-x-8 text-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>Free to list</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>5% commission only</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>24/7 support</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-100">Monthly Revenue</span>
                                        <span className="text-2xl font-bold text-green-300">↗ +24%</span>
                                    </div>
                                    <div className="text-4xl font-bold">₹2,45,000</div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-yellow-400 w-3/4 rounded-full"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-blue-100">Orders</div>
                                            <div className="text-xl font-semibold">1,247</div>
                                        </div>
                                        <div>
                                            <div className="text-blue-100">Products</div>
                                            <div className="text-xl font-semibold">89</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">10M+</div>
                            <div className="text-gray-600">Active Buyers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                            <div className="text-gray-600">Sellers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
                            <div className="text-gray-600">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                            <div className="text-gray-600">Uptime</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Start selling on NexusHub in just 3 simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Create Account</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Register on NexusHub with your phone number, email ID & GST details. Quick verification process.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. List Products</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Add your products with detailed descriptions, high-quality images, and competitive pricing.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Start Earning</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Receive orders from businesses, retailers & customers. Track sales and grow your revenue.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose NexusHub?</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Join thousands of successful sellers who trust NexusHub for their business growth
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-blue-50 rounded-2xl p-8 text-center hover:bg-blue-100 transition-colors duration-300">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Free Listing</h3>
                            <p className="text-gray-600">
                                List unlimited products on NexusHub completely free of charge
                            </p>
                        </div>

                        <div className="bg-green-50 rounded-2xl p-8 text-center hover:bg-green-100 transition-colors duration-300">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Low Commission</h3>
                            <p className="text-gray-600">
                                Pay only 5% commission on sales - lowest in the industry
                            </p>
                        </div>

                        <div className="bg-purple-50 rounded-2xl p-8 text-center hover:bg-purple-100 transition-colors duration-300">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Global Reach</h3>
                            <p className="text-gray-600">
                                Expand globally and get bulk orders from international buyers
                            </p>
                        </div>

                        <div className="bg-yellow-50 rounded-2xl p-8 text-center hover:bg-yellow-100 transition-colors duration-300">
                            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Logistics</h3>
                            <p className="text-gray-600">
                                We handle logistics and shipping to make your business easier
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">What Our Sellers Say</h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Join thousands of successful sellers who have grown their business with NexusHub
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-800 rounded-2xl p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-white font-bold">RS</span>
                                </div>
                                <div>
                                    <div className="font-semibold">Rajesh Sharma</div>
                                    <div className="text-gray-400 text-sm">Electronics Seller</div>
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                "NexusHub helped me grow my electronics business by 300% in just 6 months. The platform is user-friendly and support is excellent."
                            </p>
                            <div className="flex text-yellow-400 mt-4">
                                ★★★★★
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-2xl p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-white font-bold">PK</span>
                                </div>
                                <div>
                                    <div className="font-semibold">Priya Kumari</div>
                                    <div className="text-gray-400 text-sm">Fashion Retailer</div>
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                "The low commission and free listing made it easy for me to start. Now I'm earning ₹50,000+ monthly profit!"
                            </p>
                            <div className="flex text-yellow-400 mt-4">
                                ★★★★★
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-2xl p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-white font-bold">AJ</span>
                                </div>
                                <div>
                                    <div className="font-semibold">Amit Jain</div>
                                    <div className="text-gray-400 text-sm">Home & Kitchen</div>
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                "International orders through NexusHub have opened new markets for my business. Highly recommend!"
                            </p>
                            <div className="flex text-yellow-400 mt-4">
                                ★★★★★
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Start Selling?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join NexusHub today and take your business to the next level
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={handleGetStarted}
                            className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            {isAuthenticated ? 'Go to Dashboard' : 'Start Selling Now'}
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-2xl font-bold mb-4">
                                <span className="text-white">Nexus</span>
                                <span className="text-blue-400">Hub</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                India's leading B2B marketplace connecting sellers with millions of buyers.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-4">For Sellers</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Start Selling</a></li>
                                <li><a href="#" className="hover:text-white">Seller Dashboard</a></li>
                                <li><a href="#" className="hover:text-white">Pricing</a></li>
                                <li><a href="#" className="hover:text-white">Success Stories</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Help Center</a></li>
                                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white">Shipping</a></li>
                                <li><a href="#" className="hover:text-white">Returns</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Press</a></li>
                                <li><a href="#" className="hover:text-white">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 NexusHub. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}   

export default Homepage;

