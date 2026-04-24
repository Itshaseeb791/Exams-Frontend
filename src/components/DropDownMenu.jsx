import { useState } from "react";
import { ChevronDown } from "lucide-react";

const DropDownMenu = ({ options, value, onChange, prefix, fullWidth = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors cursor-pointer outline-none ${fullWidth ? 'w-full justify-between' : ''}`}
      >
        <div className="flex items-center gap-2">
          {prefix && <span className="text-gray-500">{prefix}</span>}
          {value}
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-auto min-w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap
                ${
                  value === option
                    ? "bg-[#0F6B75] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDownMenu;
