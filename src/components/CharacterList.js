import React from 'react';
import './CharacterList.css';

const CharacterList = ({ characters, onSelectCharacter, onDeleteCharacter }) => {
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
                  <p>Raza: {character.raza}</p>
                  <p>Clase: {character.clase}</p>
                </div>
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCharacter(index);
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