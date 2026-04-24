import React, { useState, useEffect } from "react";

const KeyFeatures = () => {
  const features = [
    {
      title: "Smart Proctoring",
      description:
        "Advanced AI-Powered proctoring system to ensure integrity and prevent cheating",
      img: "/smart 1.png",
    },
    {
      title: "Auto-Grading",
      description:
        "Automated grading system for quick and accurate assessment of student performance",
      img: "/autoo 1.png",
    },
    {
      title: "Personalized Learning",
      description:
        "Personalized learning paths tailored to individuals students need progress",
      img: "/learning 1.png",
    },
    {
      title: "Reports",
      description:
        "Detail reports and analytics to track student performance and identify area of improvement",
      img: "/reeeports 1.png",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="w-full px-4 py-6 md:px-6 md:py-10">
      {/* KEY FEATURES HEADING */}
      <div className="text-center mt-2">
        <h2 className="text-xl md:text-4xl font-bold">Key Features</h2>
        <p className="text-xs md:text-sm mt-1 max-w-md mx-auto text-gray-600 md:text-black">
          Examlytic offers a comprehensive suite of features designed to enhance
          the examination experience for both educator and learner.
        </p>
      </div>

      {/* DESKTOP SLIDER VIEW */}
      <div className="hidden md:block">
        <div className="max-w-3xl mx-auto mt-6 bg-white rounded-xl p-6 flex items-center">
          {/* LEFT TEXT */}
          <div className="w-1/2">
            <h3 className="text-3xl text-[#000000] font-bold">
              {features[currentSlide].title}
            </h3>
            <p className="mt-3 text-[#000000] font-bold w-65 text-lg max-w-sm">
              {features[currentSlide].description}
            </p>
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-1/2 flex justify-center">
            <img
              src={features[currentSlide].img}
              className="w-[450px] h-[260px] object-contain"
              alt={features[currentSlide].title}
            />
          </div>
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 mt-3">
          {features.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-gray-800" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="md:hidden space-y-4 mt-6">
        {features.map((f, i) => (
          <div key={i} className="w-full flex flex-col items-center">
            <img
              src={f.img}
              className="w-44 h-36 object-contain"
              alt={f.title}
            />
            <h3 className="text-xl font-bold mt-2 text-[#000000]">{f.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyFeatures;
