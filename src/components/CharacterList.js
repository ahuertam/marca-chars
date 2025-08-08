import React, { useState, useRef } from 'react';
import './CharacterList.css';

const CharacterList = ({ characters = [], onSelectCharacter, onDeleteCharacter }) => {
  const fileInputRef = useRef(null);

  const handleDelete = (index) => {
    if (onDeleteCharacter) onDeleteCharacter(index);
  };

  const handleImportCharacter = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedCharacter = JSON.parse(e.target.result);
          
          if (importedCharacter && typeof importedCharacter === 'object' && importedCharacter.nombre) {
            // Agregar el personaje importado usando la función del padre
            const updatedCharacters = [...characters, importedCharacter];
            localStorage.setItem('characters', JSON.stringify(updatedCharacters));
            
            // Forzar actualización recargando desde localStorage en App.js
            window.location.reload();
            
            alert(`Personaje "${importedCharacter.nombre}" importado exitosamente!`);
          } else {
            alert('El archivo JSON no tiene el formato correcto de personaje.');
          }
        } catch (error) {
          alert('Error al leer el archivo JSON. Asegúrate de que sea un archivo válido.');
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Por favor selecciona un archivo JSON válido.');
    }
    
    event.target.value = '';
  };

  return (
    <div className="character-list">
      <div className="character-list-header">
        <h2>Lista de Personajes</h2>
        <button 
          className="import-button"
          onClick={handleImportCharacter}
          title="Importar personaje desde archivo JSON"
        >
          📁 Importar Personaje
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
      
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