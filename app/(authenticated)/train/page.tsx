'use client';
import NewModel from '@/app/(authenticated)/components/newModel';
import Tutorial from '@/app/(authenticated)/components/tutorial';
import { useState } from 'react';

const TrainPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState('Person');

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1800px]">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-center">
        Trenuj Nowy Model
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <NewModel onTypeChange={setSelectedType} />
        <Tutorial />
      </div>
    </div>
  );
};

export default TrainPage;
