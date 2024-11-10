import React, { useState } from 'react';

interface TutorialProps {
  selectedType?: string;
}

const Tutorial: React.FC<TutorialProps> = ({ selectedType = 'Person' }) => {
  const [activeTab, setActiveTab] = useState(selectedType);

  // Funkcja do sprawdzania czy dany typ pasuje do aktywnej zakładki
  const matchesTab = (type: string, tab: string): boolean => {
    const typeMap: { [key: string]: string[] } = {
      'Person': ['Man', 'Woman', 'Person'],
      'Product': ['Produkt', 'Product'],
      'Style': ['Styl', 'Style'],
      'Pet': ['Zwierzę', 'Pet', 'Animal']
    };

    return typeMap[tab]?.includes(type) || false;
  };

  // Aktualizuj aktywną zakładkę gdy zmienia się selectedType
  React.useEffect(() => {
    Object.keys(tutorialContent).forEach(tab => {
      if (matchesTab(selectedType, tab)) {
        setActiveTab(tab);
      }
    });
  }, [selectedType]);

  // Treść dla różnych typów
  const tutorialContent = {
    Person: {
      examples: [1, 2, 3, 4],
      instructions: 'Name your model any name you want, and select the type of subject (Person, Man, Woman)',
      goodExamples: 'Front facing portraits, clear face shots, various expressions',
      badExamples: 'Multiple people in frame, blurry shots, face covered, full body shots'
    },
    Product: {
      examples: [1, 2, 3, 4],
      instructions: 'Name your product model and select Product type',
      goodExamples: 'Clean background, multiple angles, good lighting, consistent style',
      badExamples: 'Multiple products, busy backgrounds, poor lighting, inconsistent angles'
    },
    Style: {
      examples: [1, 2, 3, 4],
      instructions: 'Name your style model and select Style type',
      goodExamples: 'Consistent artistic style, clear visual elements, good variety',
      badExamples: 'Mixed styles, inconsistent elements, poor quality images'
    },
    Pet: {
      examples: [1, 2, 3, 4],
      instructions: 'Name your pet model and select Pet type',
      goodExamples: 'Clear pet photos, various poses, good lighting, consistent subject',
      badExamples: 'Multiple pets, blurry shots, poor lighting, inconsistent subjects'
    }
  };

  return (
    <div className="bg-secondary/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-secondary/50">
      <h2 className="text-xl font-bold mb-6 text-background-foreground">
        Tutorial
      </h2>

      {/* Tabs dla różnych typów */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 bg-secondary/20 p-2 rounded-lg">
        {Object.keys(tutorialContent).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300
              ${activeTab === tab
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'text-secondary-foreground hover:bg-secondary/30'}
              w-[120px]`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-primary mb-4">How to get results:</h3>
          
          {/* Example images grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {tutorialContent[activeTab as keyof typeof tutorialContent].examples.map((i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-secondary/40">
                <img
                  src={`/examples/${activeTab.toLowerCase()}-${i}.jpg`}
                  alt="Example"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* Input model name and type */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 mt-0.5 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-background-foreground">Input model name and type</h4>
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  {tutorialContent[activeTab as keyof typeof tutorialContent].instructions}
                </p>
              </div>
            </div>

            {/* Choose good pictures */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 mt-0.5 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-background-foreground">Choose good pictures</h4>
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  {tutorialContent[activeTab as keyof typeof tutorialContent].goodExamples}
                </p>
                
                {/* Good examples grid */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-secondary/40">
                      <img
                        src={`/examples/${activeTab.toLowerCase()}-good-${i}.jpg`}
                        alt="Good example"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Example of bad pictures */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 mt-0.5 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-background-foreground">Example of bad pictures</h4>
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  Multiple subjects, face covered, NSFW images, blurry, uncropped, full length
                </p>
                
                {/* Bad examples grid */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-secondary/40">
                      <img
                        src={`/examples/bad-${i}.jpg`}
                        alt="Bad example"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Train your model */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 mt-0.5 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-background-foreground">Train your model</h4>
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  Training your model takes ~30 minutes. You can leave the page and come back
                </p>
              </div>
            </div>

            {/* Generate images */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 mt-0.5 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-background-foreground">Generate images</h4>
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  Once your model is trained, you can generate images using prompts. Make sure to include the subject keyword in your prompts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
