// frontend/src/components/common/PageTitle.jsx
import React from 'react';

const PageTitle = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="text-lg text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;