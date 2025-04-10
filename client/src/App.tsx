import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

function HomePage() {
  // Sample blog post data for the design
  const featuredPosts = [
    {
      id: 1,
      title: "Welcome to BlogExpress",
      excerpt: "This is the first post on our new blogging platform. We're excited to share content with you!",
      date: "April 10, 2025",
      author: "Test User",
      category: "Technology"
    },
    {
      id: 2,
      title: "Getting Started with Blogging",
      excerpt: "Learn the best practices for creating engaging blog content that resonates with your audience.",
      date: "April 10, 2025",
      author: "Test User",
      category: "Writing"
    },
    {
      id: 3,
      title: "The Future of Web Development",
      excerpt: "Explore upcoming trends and technologies shaping the future of web development.",
      date: "April 10, 2025",
      author: "Test User",
      category: "Technology"
    }
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-10 shadow-xl">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Welcome to BlogExpress
            </span>
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            A modern platform for sharing your ideas with the world
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-blue-100">
              Start Reading
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Posts</h2>
          <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-500">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">{post.category}</span>
                  <span className="text-gray-500 text-sm ml-2">{post.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {post.author}</span>
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800">
                    Read More
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {['Technology', 'Writing', 'Design', 'Business', 'Health', 'Travel', 'Food', 'Lifestyle'].map((category) => (
            <div 
              key={category} 
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer border border-gray-100 hover:border-indigo-200"
            >
              <span className="font-medium text-gray-800">{category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white rounded-xl p-8 shadow-lg">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-6">Subscribe to our newsletter to get the latest blog posts and updates.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 w-full sm:w-64"
            />
            <Button className="bg-indigo-500 hover:bg-indigo-600">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">BlogExpress</h1>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-600 hover:text-indigo-600">Home</a>
                <a href="#" className="text-gray-600 hover:text-indigo-600">Categories</a>
                <a href="#" className="text-gray-600 hover:text-indigo-600">Authors</a>
                <a href="#" className="text-gray-600 hover:text-indigo-600">About</a>
              </nav>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="text-gray-600 hover:text-indigo-600">
                  Log In
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <HomePage />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">BlogExpress</h3>
                <p className="text-gray-400">A modern platform for sharing your ideas with the world.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Categories</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Technology</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Writing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Design</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Business</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 BlogExpress. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
