import React from 'react';
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaArrowLeft, 
  FaArrowRight,
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaRoute,
  FaFlag
} from 'react-icons/fa';

const RouteInstructions = ({ instructions, currentIndex, navigationData }) => {
  // Map instruction types to icons
  const getInstructionIcon = (type, modifier) => {
    const iconProps = { size: 20, className: "text-blue-600" };
    
    switch (type) {
      case 'turn':
        if (modifier === 'left') return <FaArrowLeft {...iconProps} />;
        if (modifier === 'right') return <FaArrowRight {...iconProps} />;
        if (modifier === 'sharp left') return <FaArrowCircleLeft {...iconProps} />;
        if (modifier === 'sharp right') return <FaArrowCircleRight {...iconProps} />;
        return <FaArrowUp {...iconProps} />;
      
      case 'new name':
      case 'continue':
        return <FaArrowUp {...iconProps} />;
      
      case 'merge':
      case 'on ramp':
      case 'off ramp':
        return <FaRoute {...iconProps} />;
      
      case 'arrive':
        return <FaFlag {...iconProps} className="text-green-600" />;
      
      default:
        return <FaArrowUp {...iconProps} />;
    }
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const currentInstruction = instructions[currentIndex];
  const nextInstruction = instructions[currentIndex + 1];

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-1000">
      {/* Current Instruction */}
      {currentInstruction && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            {getInstructionIcon(currentInstruction.type, currentInstruction.modifier)}
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-800">
                {currentInstruction.instruction}
              </p>
              {currentInstruction.distance && (
                <p className="text-sm text-gray-600">
                  in {formatDistance(currentInstruction.distance)}
                </p>
              )}
            </div>
          </div>
          
          {/* Street name if available */}
          {currentInstruction.name && (
            <p className="text-sm text-gray-600 ml-8">
              on {currentInstruction.name}
            </p>
          )}
        </div>
      )}

      {/* Next Instruction Preview */}
      {nextInstruction && (
        <div className="border-t pt-3">
          <p className="text-xs text-gray-500 mb-2">Then:</p>
          <div className="flex items-center gap-3">
            {getInstructionIcon(nextInstruction.type, nextInstruction.modifier)}
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {nextInstruction.instruction}
              </p>
              {nextInstruction.distance && (
                <p className="text-xs text-gray-500">
                  in {formatDistance(nextInstruction.distance)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Step {currentIndex + 1} of {instructions.length}</span>
          <span>{formatDistance(navigationData.remainingDistance)} remaining</span>
        </div>
      </div>
    </div>
  );
};

export default RouteInstructions;