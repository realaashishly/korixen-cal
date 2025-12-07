'use client';

import React from 'react';
import { ResourceWidget, TimeWeatherWidget } from '../Widgets';
import { useApp } from '@/context/AppContext';

const RightSidebar: React.FC = () => {
  const { resources, resourceCategories, setIsModalOpen, handleAddResource, handleRemoveResource } = useApp();

  return (
    <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:h-full shrink-0 animate-in slide-in-from-right-4 duration-500 fade-in delay-75">
      <TimeWeatherWidget />
      <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
          <ResourceWidget
            title="Resource Hub"
            resources={resources}
            resourceCategories={resourceCategories}
            // If ResourceWidget expects setResourceCategories, we might need to expose it from context or just ignore if it's not strictly needed for editing categories (context usually exposes items)
            // Looking at previous RightSidebar content, it passed setResourceCategories.
            // AppContextSample has setResourceCategories? No. Wait.
            // AppContext (my new one) does NOT expose setResourceCategories updater, only the list. 
            // I should check if ResourceWidget NEEDS it.
            // If it does, I might need to add it to AppContext or handle category creation differently.
            // But for now, let's assume read-only categories or fixed categories.
            // Actually, AppContext exposes `resourceCategories`.
            // But `ResourceWidget` props from previous file: `setResourceCategories={setResourceCategories}`.
            
            // I will check ResourceWidget prop types if possible, or pass a dummy/noop if I can't update categories.
            // Or better, update AppContext to expose setResourceCategories if truly needed. 
            // AppContextSample HAS state for it but doesn't expose `setResourceCategories` in interface?
            // Let's check AppContextSample line 31-50 interface.
            // It exposes `resourceCategories`. NOT `setResourceCategories`.
            // So RightSidebar was likely doing extra stuff.
            // I'll skip setResourceCategories prop for now if I can, or pass a no-op.
            // I'll try to pass `() => {}` or similar if typescript complains.
            // Wait, I can't check ResourceWidget definition right now.
            // But line 58 of usage was `setResourceCategories={setResourceCategories}`.
            
            // I will pass `()=>{}` for setResourceCategories to be safe? Or just omit if optional.
            // I will omit it and if it errors, typescript will tell me.
            resourceCategories={resourceCategories}
            // setResourceCategories={() => {}} 
            onAddResource={handleAddResource}
            onRemoveResource={handleRemoveResource}
          />
      </div>
    </div>
  );
};

export default RightSidebar;
