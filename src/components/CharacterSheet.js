import React, { useState } from 'react';
import './CharacterSheet.css';

const CharacterSheet = ({ character, onUpdateCharacter }) => {
  const [editableCharacter, setEditableCharacter] = useState(character);

  const handleChange = (field, value) => {
    const updatedCharacter = { ...editableCharacter, [field]: value };
    setEditableCharacter(updatedCharacter);
    onUpdateCharacter(updatedCharacter);
  };

  if (!character) return null;

  return (
    <div className="character-sheet">
      <h2>Ficha de Personaje</h2>
      <div className="character-info">
        <input type="text" value={editableCharacter.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
        <input type="text" value={editableCharacter.raza} onChange={(e) => handleChange('raza', e.target.value)} />
        <input type="text" value={editableCharacter.clase} onChange={(e) => handleChange('clase', e.target.value)} />
      </div>

      <div className="character-stats">
        <h4>Características</h4>
        {Object.entries(editableCharacter.caracteristicas).map(([stat, value]) => (
          <div key={stat} className="stat">
            <span className="stat-name">{stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
            <input type="number" value={value} onChange={(e) => handleChange(`caracteristicas.${stat}`, e.target.value)} />
            <span className="stat-bonus">Bon: {editableCharacter.bonificadores[stat]}</span>
          </div>
        ))}
      </div>

      <div className="character-abilities">
        <h4>Habilidades</h4>
        <ul>
          {editableCharacter.habilidades.map((habilidad, index) => (
            <li key={index}>
              <input type="text" value={habilidad} onChange={(e) => handleChange(`habilidades.${index}`, e.target.value)} />
            </li>
          ))}
        </ul>
      </div>

      <div className="character-equipment">
        <h4>Equipo</h4>
        <ul>
          {editableCharacter.equipo.map((item, index) => (
            <li key={index}>
              <input type="text" value={item} onChange={(e) => handleChange(`equipo.${index}`, e.target.value)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CharacterSheet;