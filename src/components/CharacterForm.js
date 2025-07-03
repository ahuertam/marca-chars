import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './CharacterForm.css';
import characterData from '../data/characterData.json';

const { characteristicsTooltips, classDescriptions, characterClasses } = characterData;

const initialCharacter = {
  nombre: '',
  clase: '',
  descripcion: '',
  detalles: {
    requisitos: '',
    caracteristicaPrincipal: '',
    dadoGolpe: '',
    nivelMaximo: ''
  },
  caracteristicas: {
    FUE: 0,
    DES: 0,
    CON: 0,
    INT: 0,
    SAB: 0,
    CAR: 0
  },
  bonificadores: {
    FUE: 0,
    DES: 0,
    CON: 0,
    INT: 0,
    SAB: 0,
    CAR: 0
  },
  habilidades: [],
  equipo: []
};

const CharacterForm = ({ onSaveCharacter }) => {
  const [character, setCharacter] = useState(initialCharacter);
  const [newItem, setNewItem] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [modificadores, setModificadores] = useState({ FUE: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 });
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const rollDice = () => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls[0] + rolls[1] + rolls[2];
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
    const storedCharacters = JSON.parse(localStorage.getItem('characters')) || [];
    const updatedCharacters = [...storedCharacters, character];
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
    onSaveCharacter(character);
    setCharacter(initialCharacter);
    setNewSkillName('');
    setNewSkillDescription('');
    setNewItem('');
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
    if (newSkillName.trim() && newSkillDescription.trim()) {
      setCharacter({
        ...character,
        habilidades: [...character.habilidades, { nombre: newSkillName.trim(), descripcion: newSkillDescription.trim() }]
      });
      setNewSkillName('');
      setNewSkillDescription('');
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
        <select
          value={character.clase}
          onChange={(e) => {
            const selectedClass = e.target.value;
            const classInfo = classDescriptions[selectedClass] || {
              descripcion: '',
              detalles: {
                requisitos: '',
                caracteristicaPrincipal: '',
                dadoGolpe: '',
                nivelMaximo: ''
              }
            };
            setCharacter({
              ...character,
              clase: selectedClass,
              descripcion: classInfo.descripcion,
              detalles: classInfo.detalles
            });
          }}
          required
        >
          <option value="">Selecciona una clase</option>
          {characterClasses.map((clase, index) => (
            <option key={index} value={clase}>{clase}</option>
          ))}
        </select>
      </div>

      {character.clase && (
        <>
          <div className="form-group description-group">
            <label>Descripción:</label>
            <div className="description-text">{character.descripcion}</div>
          </div>

          <div className="form-group details-group">
            <label>Detalles de la clase:</label>
            <div className="class-details">
              <div><strong>Requisitos:</strong> {character.detalles.requisitos}</div>
              <div><strong>Característica principal:</strong> {character.detalles.caracteristicaPrincipal}</div>
              <div><strong>Dado de golpe:</strong> {character.detalles.dadoGolpe}</div>
              <div><strong>Nivel máximo:</strong> {character.detalles.nivelMaximo}</div>
            </div>
          </div>
        </>
      )}

      <div className="stats-section">
        <h3>Características</h3>
        {Object.keys(character.caracteristicas).map((stat) => (
          <div key={stat} className="stat-group">
            <label 
              data-tooltip-id="stat-tooltip" 
              data-tooltip-content={characteristicsTooltips[stat]}
            >
              {stat}
            </label>
            <Tooltip id="stat-tooltip" />
            <div className="stat-controls">
              <input
                type="number"
                value={character.caracteristicas[stat]}
                readOnly
              />
              <button
                type="button"
                className="dice-button"
                onClick={() => handleRoll(stat, modificadores[stat])}
              >
                🎲
              </button>
              <input
                type="number"
                className="modifier-input"
                placeholder="Mod"
                value={modificadores[stat]}
                onChange={(e) => setModificadores({ ...modificadores, [stat]: parseInt(e.target.value) || 0 })}
              />
              <span className={`bonus-value ${character.bonificadores[stat] > 0 ? 'positive' : character.bonificadores[stat] < 0 ? 'negative' : ''}`}>
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
              <input type="text" value={habilidad.nombre} readOnly />
              <textarea value={habilidad.descripcion} readOnly />
              <button type="button" onClick={() => handleRemoveSkill(index)}>🗑️</button>
            </div>
          ))}
          <div className="item-input-group">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Nombre de la habilidad"
            />
            <textarea
              value={newSkillDescription}
              onChange={(e) => setNewSkillDescription(e.target.value)}
              placeholder="Descripción de la habilidad"
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
              <input type="text" value={item.nombre} readOnly />
              <textarea value={item.descripcion} readOnly />
              <button type="button" onClick={() => handleRemoveItem(index)}>🗑️</button>
            </div>
          ))}
          <div className="item-input-group">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Nombre del objeto"
            />
            <textarea
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              placeholder="Descripción del objeto"
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
