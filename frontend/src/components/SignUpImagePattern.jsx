const SignUpImagePattern = ({ title, subtitle }) => {
  // Array of image filenames (ensure these images exist in the public folder)
  const imagePaths = [
    "/images/krishn.jpeg", 
    "/images/rider.jpeg",
    "/images/peakyblinder.jpeg",
    "/images/vk.jpeg",
    "/images/marvel.jpeg",
    "/images/spidey.jpeg",
    "/images/deadpool.jpeg",
    "/images/offline.jpeg",
    "/images/planets.jpeg",
  ];

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div
        className="max-w-md text-center"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
          animation: "gallary 20s linear infinite",
        }}
      >
        <div className="pt-8 grid grid-cols-3 gap-3 mb-8">
          {imagePaths.map((path, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <img
                src={path}
                alt={`Auth Pattern ${i + 1}`}
                className="w-full h-full object-cover transform transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default SignUpImagePattern;
