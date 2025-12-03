
import React from 'react';
import { Leaf, Trees, Zap } from 'lucide-react';

const AuthBanner = () => {
  return (
    <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-green-600 to-emerald-800 text-white p-12 rounded-2xl">
      <div className="max-w-lg">
        <h1 className="text-5xl font-extrabold mb-6 flex items-center gap-4">
          <Leaf className="w-14 h-14" />
          DriveSutraGo
        </h1>

        <p className="text-xl leading-relaxed mb-10">
          Turn every trip into a step toward a greener planet.
          <span className="block text-yellow-300 font-bold mt-2">
            Travel smart. Earn rewards. Save Earth.
          </span>
        </p>

        <div className="space-y-6 text-lg">
          <div className="flex items-center gap-4">
            <Trees className="w-10 h-10 text-green-200" />
            <span>Grow your virtual forest</span>
          </div>
          <div className="flex items-center gap-4">
            <Zap className="w-10 h-10 text-yellow-300" />
            <span>Earn XP, badges & real impact</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthBanner;