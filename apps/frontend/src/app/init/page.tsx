import React from "react";

function page() {
  return (
    <div className="flex justify-center h-screen items-center">
      <video
        src="https://res.cloudinary.com/dhxeo4rvc/video/upload/v1717323084/0602_z8vsyt.mov"
        autoPlay
        controls
        className="w-4/6 rounded-xl"
      />
    </div>
  );
}

export default page;
