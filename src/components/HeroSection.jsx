import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center w-full px-4 py-6 md:px-6 md:py-10">
      <div className="max-w-7xl w-full rounded-xl p-6 md:p-10 text-center md:text-left md:bg-[#0F6B75] md:text-white">
        <h1 className="text-[29px] md:text-4xl font-bold leading-snug md:leading-tight">
          AI-Powered Exams.
          <br />
          Smarter Learning.
          <br />
          Secure Future.
        </h1>

        <p className="mt-3 md:mt-4 text-xs md:text-sm max-w-md mx-auto md:mx-0">
          Examlytic is an AI-powered online examination system with smart
          proctoring, automated grading, and personalized learning paths.
        </p>

        <div className="flex justify-center md:justify-start gap-4 mt-4 md:mt-6">
          <button className="px-6 py-2 rounded-xl font-semibold text-white bg-[#106C79] md:bg-[#0FA4AFAF] hover:bg-[#0F5F6A] md:hover:bg-[#0F6B75] shadow-md transition-all duration-200">
            Get Started
          </button>

          <button
            className="hidden md:block px-6 py-2 bg-white text-black rounded-xl font-semibold shadow-md hover:bg-gray-300 transition-all duration-200"
            onClick={() => navigate("/login", { replace: true })}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
