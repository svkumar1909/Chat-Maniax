const LoginImagePattern = ({ title, subtitle }) => {
    const imagePaths = [
      "/images/Deadpul.jpeg", 
      "/images/deadpool.jpeg",  
      "/images/spider.jpeg", 
      "/images/Venom.jpeg",     
    ];
  
    return (
      <div className="flex items-center justify-center bg-base-200 p-12">
        <div className="max-w-lg text-center relative w-full">
          <div className="grid grid-cols-2 gap-6">
            {/* 1st Image */}
            <div className="relative group w-full h-96">
              <img
                src={imagePaths[0]}
                alt="First Image"
                className="w-full h-full object-cover absolute transition-all duration-500 group-hover:opacity-0 group-hover:scale-90 group-hover:transform group-hover:translate-y-[-50px] group-hover:translate-z-[100px]"
              />
              <img
                src={imagePaths[1]}
                alt="Second Image"
                className="w-full h-full object-cover absolute opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-100"
              />
            </div>
  
            {/* 3rd Image */}
            <div className="relative group w-full h-96">
              <img
                src={imagePaths[2]}
                alt="Third Image"
                className="w-full h-full object-cover absolute transition-all duration-500 group-hover:opacity-0 group-hover:scale-90 group-hover:transform group-hover:translate-y-[-50px] group-hover:translate-z-[100px]"
              />
              <img
                src={imagePaths[3]}
                alt="Fourth Image"
                className="w-full h-full object-cover absolute opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-100"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-6">{title}</h2>
          <p className="text-base-content/60">{subtitle}</p>
        </div>
      </div>
    );
  };
  
  export default LoginImagePattern;
  