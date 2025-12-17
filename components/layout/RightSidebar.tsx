'use client';

import React from 'react';
import { ResourceWidget, TimeWeatherWidget } from '../Widgets';
import { useApp } from '@/context/AppContext';

const RightSidebar: React.FC = () => {
  const { resources, resourceCategories, handleUpdateResourceCategories, handleAddResource, handleRemoveResource } = useApp();

  return (
    <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:h-full shrink-0 animate-in slide-in-from-right-4 duration-500 fade-in delay-75">
      <TimeWeatherWidget />
      <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
          <ResourceWidget
            title="Resource Hub"
            resources={resources}
            resourceCategories={resourceCategories}
            onUpdateCategories={handleUpdateResourceCategories}
            onAddResource={handleAddResource}
            onRemoveResource={handleRemoveResource}
          />
      </div>
    </div>
  );
};

export default RightSidebar;
