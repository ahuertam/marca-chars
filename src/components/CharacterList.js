import React, { useState, useEffect } from 'react';
import './CharacterList.css';

const CharacterList = ({ onSelectCharacter, onDeleteCharacter }) => {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    const storedCharacters = JSON.parse(localStorage.getItem('characters')) || [];
    setCharacters(storedCharacters);
  }, []);

  const handleDelete = (index) => {
    const newCharacters = characters.filter((_, i) => i !== index);
    setCharacters(newCharacters);
    localStorage.setItem('characters', JSON.stringify(newCharacters));
    if (onDeleteCharacter) onDeleteCharacter(index);
  };

  return (
    <div className="character-list">
      <h2>Lista de Personajes</h2>
      {characters.length === 0 ? (
        <p>No hay personajes creados</p>
      ) : (
        <ul>
          {characters.map((character, index) => (
            <li key={index}>
              <div className="character-item">
                <div className="character-info" onClick={() => onSelectCharacter(character)}>
                  <h3>{character.nombre}</h3>
                  <p>Clase: {character.clase}</p>
                </div>
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                >
                  ❌
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CharacterList;