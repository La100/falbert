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
      instructions: 'Nazwij swój model i wybierz typ podmiotu (Osoba, Mężczyzna, Kobieta)',
      goodExamples: 'Portrety z przodu, wyraźne zdjęcia twarzy, różne wyrazy twarzy',
      badExamples: 'Wiele osób w kadrze, nieostre zdjęcia, zasłonięta twarz, zdjęcia całej sylwetki'
    },
    Product: {
      examples: [1, 2, 3, 4],
      instructions: 'Nazwij swój model produktu i wybierz typ Produkt',
      goodExamples: 'Czyste tło, wiele kątów, dobre oświetlenie, spójny styl',
      badExamples: 'Wiele produktów, przeładowane tło, słabe oświetlenie, niespójne kąty'
    },
    Style: {
      examples: [1, 2, 3, 4],
      instructions: 'Nazwij swój model stylu i wybierz typ Styl',
      goodExamples: 'Spójny styl artystyczny, wyraźne elementy wizualne, dobra różnorodność',
      badExamples: 'Mieszane style, niespójne elementy, zdjęcia słabej jakości'
    },
    Pet: {
      examples: [1, 2, 3, 4],
      instructions: 'Nazwij swój model zwierzęcia i wybierz typ Zwierzę',
      goodExamples: 'Wyraźne zdjęcia zwierząt, różne pozy, dobre oświetlenie, spójny podmiot',
      badExamples: 'Wiele zwierząt, nieostre zdjęcia, słabe oświetlenie, niespójne podmioty'
    }
  };

  return (
    <div className="bg-secondary/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-secondary/50">
      <h2 className="text-xl font-bold mb-6 text-background-foreground">
        Samouczek
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
          <h3 className="text-lg font-medium text-primary mb-4">Jak uzyskać rezultaty:</h3>
          
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
                <h4 className="font-medium text-background-foreground">Wprowadź nazwę modelu i typ</h4>
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
                <h4 className="font-medium text-background-foreground">Wybierz dobre zdjęcia</h4>
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
                <h4 className="font-medium text-background-foreground">Przykłady złych zdjęć</h4>
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  Wiele podmiotów, zasłonięta twarz, zdjęcia NSFW, nieostre, nieprzycięte, całe sylwetki
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
                <h4 className="font-medium text-background-foreground">Wytrenuj swój model</h4>
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  Trenowanie modelu trwa około 30 minut. Możesz opuścić stronę i wrócić później
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
                <h4 className="font-medium text-background-foreground">Generuj obrazy</h4>
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  Po wytrenowaniu modelu możesz generować obrazy używając promptów. Pamiętaj, aby zawrzeć słowo kluczowe podmiotu w swoich promptach.
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
