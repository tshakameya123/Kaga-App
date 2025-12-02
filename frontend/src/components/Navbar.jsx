import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { RiHome6Line, RiInformationLine, RiMailLine, RiLoginBoxLine, RiUserHeartLine, RiNotification3Line } from "react-icons/ri";
import { FaUserMd } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(false);
    navigate("/login");
  };

  const activeClass = "text-primary border-b-2 border-primary"; // Active style

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD]">
      <img
        onClick={() => navigate("/")}
        className="w-16 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />
      <ul className="md:flex items-start gap-8 font-medium hidden">
        <NavLink
          to="/"
          className={({ isActive }) => 
            `transition-all hover:text-primary ${isActive ? activeClass : ""}`
          }
        >
          <li className="py-2 flex items-center gap-2 px-1">
            <RiHome6Line className="text-primary text-2xl" /> 
            <span className="tracking-wide">HOME</span>
          </li>
        </NavLink>
        <NavLink
          to="/doctors"
          className={({ isActive }) => 
            `transition-all hover:text-primary ${isActive ? activeClass : ""}`
          }
        >
          <li className="py-2 flex items-center gap-2 px-1">
            <RiUserHeartLine className="text-primary text-2xl" /> 
            <span className="tracking-wide">DOCTORS</span>
          </li>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => 
            `transition-all hover:text-primary ${isActive ? activeClass : ""}`
          }
        >
          <li className="py-2 flex items-center gap-2 px-1">
            <RiInformationLine className="text-primary text-2xl" /> 
            <span className="tracking-wide">ABOUT</span>
          </li>
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => 
            `transition-all hover:text-primary ${isActive ? activeClass : ""}`
          }
        >
          <li className="py-2 flex items-center gap-2 px-1">
            <RiMailLine className="text-primary text-2xl" /> 
            <span className="tracking-wide">CONTACT</span>
          </li>
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-3 cursor-pointer group relative">
            <div className="relative">
              <img 
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:border-primary transition-all duration-300" 
                src={userData.image} 
                alt="User Profile" 
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="absolute top-0 right-0 pt-16 text-sm font-medium text-gray-700 z-30 hidden group-hover:block">
              <div className="min-w-56 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col py-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>
                <div className="py-2">
                  <p
                    onClick={() => navigate("/my-profile")}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                  >
                    <RiUserHeartLine className="text-primary text-lg" />
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("/my-appointments")}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                  >
                    <FaUserMd className="text-primary text-lg" />
                    My Appointments
                  </p>
                  <p
                    onClick={() => navigate("/notifications")}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                  >
                    <RiNotification3Line className="text-primary text-lg" />
                    Notifications
                  </p>
                  <div className="border-t border-gray-100 my-1"></div>
                  <p 
                    onClick={logout} 
                    className="px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center gap-3 text-red-600 transition-colors duration-200"
                  >
                    <RiLoginBoxLine className="text-red-500 text-lg" />
                    Logout
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-2.5 rounded-full font-medium hidden md:flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <RiLoginBoxLine className="text-xl" /> 
            <span className="tracking-wide">Sign Up</span>
          </button>
        )}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="Menu"
        />

        {/* ---- Mobile Menu ---- */}
        <div
          className={`md:hidden ${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img src={assets.logo} className="w-14" alt="Logo" />
            <img
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              className="w-7"
              alt="Close"
            />
          </div>
          <ul className="flex flex-col items-center gap-4 mt-8 px-5 text-lg font-medium">
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/"
              className={({ isActive }) => 
                `transition-all hover:text-primary ${isActive ? activeClass : ""}`
              }
            >
              <p className="px-4 py-2 flex items-center gap-3">
                <RiHome6Line className="text-primary text-2xl" /> 
                <span className="tracking-wide">HOME</span>
              </p>
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/doctors"
              className={({ isActive }) => 
                `transition-all hover:text-primary ${isActive ? activeClass : ""}`
              }
            >
              <p className="px-4 py-2 flex items-center gap-3">
                <RiUserHeartLine className="text-primary text-2xl" /> 
                <span className="tracking-wide">DOCTORS</span>
              </p>
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/about"
              className={({ isActive }) => 
                `transition-all hover:text-primary ${isActive ? activeClass : ""}`
              }
            >
              <p className="px-4 py-2 flex items-center gap-3">
                <RiInformationLine className="text-primary text-2xl" /> 
                <span className="tracking-wide">ABOUT</span>
              </p>
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/contact"
              className={({ isActive }) => 
                `transition-all hover:text-primary ${isActive ? activeClass : ""}`
              }
            >
              <p className="px-4 py-2 flex items-center gap-3">
                <RiMailLine className="text-primary text-2xl" /> 
                <span className="tracking-wide">CONTACT</span>
              </p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
