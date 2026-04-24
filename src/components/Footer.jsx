import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#0F6B75] text-white text-center py-6 mt-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center md:mx-10 mb-4 md:mb-0">
        <div className="flex justify-center gap-6 text-sm font-medium md:justify-start">
          <a href="#" className="hover:text-gray-200">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-200">
            Terms of Service
          </a>
          <a href="#" className="hover:text-gray-200">
            Contact Us
          </a>
        </div>

        <div className="flex justify-center gap-4 md:gap-10 mt-4 md:mt-0">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/twitter 1.png"
              alt="Twitter"
              className="w-8 h-8 md:w-12 md:h-12 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/instagram 1.png"
              alt="Instagram"
              className="w-8 h-8 md:w-12 md:h-12 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/facebook 1.png"
              alt="Facebook"
              className="w-8 h-8 md:w-12 md:h-12 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </a>
        </div>
      </div>

      <p className="text-white text-xs md:text-sm mt-4 md:mt-8">
        © 2026 Examlytic. All rights reserved
      </p>
    </footer>
  );
}
