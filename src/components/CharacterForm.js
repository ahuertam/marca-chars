import React, { useState } from 'react';
import './CharacterForm.css';

const CharacterForm = ({ onSaveCharacter }) => {
  const [character, setCharacter] = useState({
    nombre: '',
    clase: '',
    caracteristicas: {
      fuerza: 0,
      destreza: 0,
      constitucion: 0,
      inteligencia: 0,
      sabiduria: 0,
      carisma: 0
    },
    bonificadores: {
      fuerza: 0,
      destreza: 0,
      constitucion: 0,
      inteligencia: 0,
      sabiduria: 0,
      carisma: 0
    },
    habilidades: [],
    equipo: []
  });

  const [newItem, setNewItem] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const rollDice = () => {
    // Tirar 3d6
    const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
    // Ordenar de mayor a menor
    rolls.sort((a, b) => b - a);
    // Descartar el más bajo y sumar los otros dos
    return rolls[0] + rolls[1];
  };

  const calculateBonus = (value) => {
    if (value <= 3) return -3;
    if (value <= 5) return -2;
    if (value <= 8) return -1;
    if (value <= 12) return 0;
    if (value <= 15) return 1;
    if (value <= 17) return 2;
    return Math.floor((value - 15) / 2) + 2;
  };

  const handleRoll = (stat, modifier = 0) => {
    const result = rollDice() + parseInt(modifier);
    const newCharacter = { ...character };
    newCharacter.caracteristicas[stat] = result;
    newCharacter.bonificadores[stat] = calculateBonus(result);
    setCharacter(newCharacter);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveCharacter(character);
    setCharacter({
      nombre: '',
      clase: '',
      caracteristicas: {
        fuerza: 0,
        destreza: 0,
        constitucion: 0,
        inteligencia: 0,
        sabiduria: 0,
        carisma: 0
      },
      bonificadores: {
        fuerza: 0,
        destreza: 0,
        constitucion: 0,
        inteligencia: 0,
        sabiduria: 0,
        carisma: 0
      },
      habilidades: [],
      equipo: []
    });
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setCharacter({
        ...character,
        equipo: [...character.equipo, newItem.trim()]
      });
      setNewItem('');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setCharacter({
        ...character,
        habilidades: [...character.habilidades, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveItem = (index) => {
    const newEquipo = character.equipo.filter((_, i) => i !== index);
    setCharacter({ ...character, equipo: newEquipo });
  };

  const handleRemoveSkill = (index) => {
    const newHabilidades = character.habilidades.filter((_, i) => i !== index);
    setCharacter({ ...character, habilidades: newHabilidades });
  };

  return (
    <form onSubmit={handleSubmit} className="character-form">
      <h2>Crear Nuevo Personaje</h2>
      
      <div className="form-group">
        <label>Nombre:</label>
        <input
          type="text"
          value={character.nombre}
          onChange={(e) => setCharacter({...character, nombre: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Clase:</label>
        <input
          type="text"
          value={character.clase}
          onChange={(e) => setCharacter({...character, clase: e.target.value})}
          required
        />
      </div>

      <div className="stats-section">
        <h3>Características</h3>
        {Object.keys(character.caracteristicas).map((stat) => (
          <div key={stat} className="stat-group">
            <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
            <div className="stat-controls">
              <input
                type="number"
                value={character.caracteristicas[stat]}
                readOnly
              />
              <button
                type="button"
                className="dice-button"
                onClick={() => handleRoll(stat)}
              >
                🎲
              </button>
              <input
                type="number"
                className="modifier-input"
                placeholder="Mod"
                onChange={(e) => handleRoll(stat, e.target.value)}
              />
              <span className="bonus-value">
                Bonificador: {character.bonificadores[stat]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="editable-list">
        <h3>Habilidades</h3>
        <div className="editable-list-items">
          {character.habilidades.map((habilidad, index) => (
            <div key={index} className="item-input-group">
              <input type="text" value={habilidad} readOnly />
              <button type="button" onClick={() => handleRemoveSkill(index)}>🗑️</button>
            </div>
          ))}
          <div className="item-input-group">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Nueva habilidad"
            />
            <button type="button" onClick={handleAddSkill}>+</button>
          </div>
        </div>
      </div>

      <div className="editable-list">
        <h3>Inventario</h3>
        <div className="editable-list-items">
          {character.equipo.map((item, index) => (
            <div key={index} className="item-input-group">
              <input type="text" value={item} readOnly />
              <button type="button" onClick={() => handleRemoveItem(index)}>🗑️</button>
            </div>
          ))}
          <div className="item-input-group">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Nuevo objeto"
            />
            <button type="button" onClick={handleAddItem}>+</button>
          </div>
        </div>
      </div>

      <button type="submit">Guardar Personaje</button>
    </form>
  );
};

export default CharacterForm;