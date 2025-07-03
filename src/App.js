import React, { useState, useEffect } from 'react';
import './App.css';
import CharacterForm from './components/CharacterForm';
import CharacterList from './components/CharacterList';
import CharacterSheet from './components/CharacterSheet';

function App() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  useEffect(() => {
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
  }, []);

  const handleSaveCharacter = (character) => {
    const updatedCharacters = [...characters, character];
    setCharacters(updatedCharacters);
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
  };

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
  };

  const handleDeleteCharacter = (index) => {
    const updatedCharacters = characters.filter((_, i) => i !== index);
    setCharacters(updatedCharacters);
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
    if (selectedCharacter === characters[index]) {
      setSelectedCharacter(null);
    }
  };

  const handleUpdateCharacter = (updatedCharacter) => {
    const updatedCharacters = characters.map(char =>
      char === selectedCharacter ? updatedCharacter : char
    );
    setCharacters(updatedCharacters);
    setSelectedCharacter(updatedCharacter);
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
  };

  const [currentView, setCurrentView] = useState('list');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Creador de Personajes - La Marca del Este</h1>
        <div className="nav-buttons">
          <button 
            onClick={() => setCurrentView('list')} 
            className={currentView === 'list' ? 'active' : ''}
          >
            Lista de Personajes
          </button>
          <button 
            onClick={() => setCurrentView('create')} 
            className={currentView === 'create' ? 'active' : ''}
          >
            Crear Personaje
          </button>
        </div>
      </header>
      <main className="App-main">
        {currentView === 'list' ? (
          <div className="full-width-view">
            <CharacterList
              characters={characters}
              onSelectCharacter={handleSelectCharacter}
              onDeleteCharacter={handleDeleteCharacter}
            />
            {selectedCharacter && (
              <CharacterSheet
                character={selectedCharacter}
                onUpdateCharacter={handleUpdateCharacter}
              />
            )}
          </div>
        ) : (
          <div className="full-width-view">
            <CharacterForm onSaveCharacter={(character) => {
              handleSaveCharacter(character);
              setCurrentView('list');
            }} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
