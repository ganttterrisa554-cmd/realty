import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">
            Invitation Home Rentals
          </h2>
          <p className="text-sm text-gray-600">
            Unlocking more than doors — we unlock your future.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary">
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/properties?location=texas"
                className="hover:text-primary"
              >
                Browse Properties
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm text-gray-600">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Contact Us
          </h3>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-1" />
            <span>7155 Old Katy Rd Ste N210, Houston, TX 77024</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <span>(832) 555-7890</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <span>contact@invitationhomerentals.com</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-4 mt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Invitation Home Rentals. All rights
        reserved.
      </div>
    </footer>
  );
}
