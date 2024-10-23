'use client';
import NewModel from '../../components/newModel';

const ModelsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trenuj Nowy Model</h1>
      <NewModel />
    </div>
  );
};

export default ModelsPage;
