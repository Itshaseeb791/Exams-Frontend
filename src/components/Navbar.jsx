import { Menu } from "lucide-react";

const Navbar = ({ toggleSidebar, userName = "User Name" }) => {
  return (
    <div className="w-full h-16 bg-[#0F6B75] flex items-center justify-between px-4 text-white fixed top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <img
          src="https://plus.unsplash.com/premium_vector-1727955579185-ed12a1c678de?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmlsZSUyMGljb258ZW58MHx8MHx8fDA%3D"
          alt="User"
          className="w-10 h-10 rounded-full border-2 border-white"
        />
        <span className="font-semibold text-lg hidden sm:block">{userName}</span>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        <img src="/logo.png" alt="Examlytic Logo" className="w-14 h-12" />
        <span className="text-2xl font-bold tracking-wide cursor-default">Examlytic</span>
      </div>

      {/* Right side - Hamburger Menu */}
      <div className="flex items-center justify-end min-w-10">
        <button
          onClick={toggleSidebar}
          onMouseDown={(e) => e.stopPropagation()}
          className="md:hidden text-white"
        >
          <Menu size={28} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
