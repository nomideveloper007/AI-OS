import React from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteModal } from './WebsiteModal';

export const AddWebsiteModal: React.FC = () => {
  const { isAddWebsiteOpen, setIsAddWebsiteOpen } = useApp();

  return (
    <WebsiteModal 
      isOpen={isAddWebsiteOpen} 
      onClose={() => setIsAddWebsiteOpen(false)} 
    />
  );
};
