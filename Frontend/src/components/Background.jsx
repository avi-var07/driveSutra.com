import React from "react";

function Background({ playStatus, heroCount, bgVideo, bgImages }) {
  return (
    <div className="absolute inset-0 z-0">
      {playStatus ? (
        <video
          className="w-full h-full object-cover fixed inset-0 fade-in"
          src={bgVideo}
          autoPlay
          loop
          muted
        />
      ) : (
        <img
          className="w-full h-full object-cover fixed inset-0 fade-in"
          src={bgImages[heroCount]}
          alt={`Background ${heroCount + 1}`}
        />
      )}
    </div>
  );
}

export default Background;
