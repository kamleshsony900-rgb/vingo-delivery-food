import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (

    <footer className="bg-gray-900 text-gray-300 pt-10 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">

        {/* Logo + About */}
        <div>
          <h2 className="text-2xl font-bold text-white">FoodExpress</h2>
          <p className="mt-3 text-sm">
            Fast and reliable food delivery at your doorstep.
            Discover the best restaurants around you.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/#" className="hover:text-white">Home</a></li>
            <li><a href="/#" className="hover:text-white">Menu</a></li>
            <li><a href="/#" className="hover:text-white">Restaurants</a></li>
            <li>
              <Link to="/feedback" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Customer</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">My Account</a></li>
            <li><Link to="/my-orders" className="hover:text-white">Orders</Link></li>
            <li><a href="#" className="hover:text-white">Wishlist</a></li>
            <li> <Link to="/help" className="hover:text-white">
              Help Center
            </Link></li>
          </ul>
        </div>

        {/* Contact + Social */}
        <div>
          <Link to={"/#"}><h3 className="text-lg font-semibold text-white mb-3">Contact</h3></Link>
          <Link className="link text-[13px]" to="mailto:someone@example.com">
            sahvingo@gmail.com</Link>
          <p className="text-sm mt-1">+971 558 545 642</p>

          <div className="flex gap-4 mt-4 text-xl">
            <FaFacebook className="hover:text-white cursor-pointer" />
            <FaInstagram className="hover:text-white cursor-pointer" />
            <FaTwitter className="hover:text-white cursor-pointer" />
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
        © {new Date().getFullYear()} FoodExpress. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
