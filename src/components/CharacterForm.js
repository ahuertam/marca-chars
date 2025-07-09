import React, { useState, useEffect } from 'react';
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
  puntosGolpe: 0,
  claseArmadura: 0,
  iniciativa: 0,
  ataqueCuerpoACuerpo: 0,
  ataqueProyectiles: 0,
  venenoOMuerte: 0,
  varitasYCetros: 0,
  petrificacionOParalisis: 0,
  armasDeAliento: 0,
  conjurosYArmasMagicas: 0,
  movimiento: {
    base: 0,
    combate: 0,
    carrera: 0,
    cargado: 0
  },
  idiomas: '',
  habilidadesPorcentaje: {
    abrirCerraduras: 0,
    encontrarTrampas: 0,
    hurtar: 0,
    moverseEnSilencio: 0,
    esconderseEnLasSombras: 0,
    comprenderLenguajes: 0,
    usarPergaminos: 0,
    escucharRuidos: 0,
  },
  habilidadesDeClase: '',
  habilidades: [],
  objetos: [],
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
  const [newItemArmorBonus, setNewItemArmorBonus] = useState(0);
  const [newItemAttackBonus, setNewItemAttackBonus] = useState(0);

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
              <input
                type="text"
                value={habilidad.nombre}
                onChange={(e) => {
                  const newHabilidades = [...character.habilidades];
                  newHabilidades[index].nombre = e.target.value;
                  setCharacter({ ...character, habilidades: newHabilidades });
                }}
                placeholder="Nombre de la habilidad"
              />
              <textarea
                value={habilidad.descripcion}
                onChange={(e) => {
                  const newHabilidades = [...character.habilidades];
                  newHabilidades[index].descripcion = e.target.value;
                  setCharacter({ ...character, habilidades: newHabilidades });
                }}
                placeholder="Descripción de la habilidad"
              />
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
    <div className="form-group">
      <table className="tabla-salvaciones">
        <thead>
          <tr>
            <th>Clase de Armadura</th>
            <th>Puntos de Golpe:</th>
            <th>Iniciativa:</th>
            <th>Ataque Cuerpo a Cuerpo:</th>
            <th>Ataque Proyectiles:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td> <input
        type="number"
        value={character.claseArmadura}
        onChange={(e) => setCharacter({ ...character, claseArmadura: parseInt(e.target.value) || 0 })}
      /></td>
            <td> <input
        type="number"
        value={character.puntosGolpe}
        onChange={(e) => setCharacter({ ...character, puntosGolpe: parseInt(e.target.value) || 0 })}
      /></td>
            <td><input
        type="number"
        value={character.iniciativa}
        onChange={(e) => setCharacter({ ...character, iniciativa: parseInt(e.target.value) || 0 })}
      /></td>
            <td><input
        type="number"
        value={character.ataqueCuerpoACuerpo}
        onChange={(e) => setCharacter({ ...character, ataqueCuerpoACuerpo: parseInt(e.target.value) || 0 })}
      /></td>
            <td> <input
        type="number"
        value={character.ataqueCuerpoACuerpo}
        onChange={(e) => setCharacter({ ...character, ataqueCuerpoACuerpo: parseInt(e.target.value) || 0 })}
      /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="form-group">
      <label>Tabla de Tiradas de Salvación</label>
      <table className="tabla-salvaciones">
        <thead>
          <tr>
            <th>Venenos y Muerte</th>
            <th>Varitas Mágicas y Cetros</th>
            <th>Petrificación o Parálisis</th>
            <th>Armas de Aliento</th>
            <th>Conjuros y Armas Mágicas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="number" value={character.venenoOMuerte} onChange={(e) => setCharacter({ ...character, venenoOMuerte: parseInt(e.target.value) || 0 })} /></td>
            <td><input type="number" value={character.varitasYCetros} onChange={(e) => setCharacter({ ...character, varitasYCetros: parseInt(e.target.value) || 0 })} /></td>
            <td><input type="number" value={character.petrificacionOParalisis} onChange={(e) => setCharacter({ ...character, petrificacionOParalisis: parseInt(e.target.value) || 0 })} /></td>
            <td><input type="number" value={character.armasDeAliento} onChange={(e) => setCharacter({ ...character, armasDeAliento: parseInt(e.target.value) || 0 })} /></td>
            <td><input type="number" value={character.conjurosYArmasMagicas} onChange={(e) => setCharacter({ ...character, conjurosYArmasMagicas: parseInt(e.target.value) || 0 })} /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="form-group">
      <label>Movimiento</label>
      <table className="movimiento-table">
        <thead>
          <tr>
            <th>Base</th>
            <th>Combate</th>
            <th>Carrera</th>
            <th>Cargado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="number" value={character.movimiento.base} onChange={(e) => setCharacter({ ...character, movimiento: { ...character.movimiento, base: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.movimiento.combate} onChange={(e) => setCharacter({ ...character, movimiento: { ...character.movimiento, combate: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.movimiento.carrera} onChange={(e) => setCharacter({ ...character, movimiento: { ...character.movimiento, carrera: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.movimiento.cargado} onChange={(e) => setCharacter({ ...character, movimiento: { ...character.movimiento, cargado: parseInt(e.target.value) || 0 } })} /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="form-group">
      <label>Idiomas:</label>
      <input
        type="text"
        value={character.idiomas}
        onChange={(e) => setCharacter({ ...character, idiomas: e.target.value })}
      />
    </div>

    <div className="form-group">
      <label>Habilidades con Porcentaje</label>
      <table className="habilidades-porcentaje-table">
        <thead>
          <tr>
            <th>Abrir Cerraduras</th>
            <th>Encontrar / Desactivar Trampas</th>
            <th>Hurtar</th>
            <th>Moverse en Silencio</th>
            <th>Esconderse en las Sombras</th>
            <th>Comprender Lenguajes</th>
            <th>Usar Pergaminos</th>
            <th>Escuchar ruidos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="number" value={character.habilidadesPorcentaje.abrirCerraduras} onChange={(e) => setCharacter({ ...character, habilidadesPorcentaje: { ...character.habilidadesPorcentaje, abrirCerraduras: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.habilidadesPorcentaje.encontrarTrampas} onChange={(e) => setCharacter({ ...character, habilidadesPorcentaje: { ...character.habilidadesPorcentaje, encontrarTrampas: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.habilidadesPorcentaje.hurtar} onChange={(e) => setCharacter({ ...character, habilidadesPorcentaje: { ...character.habilidadesPorcentaje, hurtar: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.habilidadesPorcentaje.moverseEnSilencio} onChange={(e) => setCharacter({ ...character, habilidadesPorcentaje: { ...character.habilidadesPorcentaje, moverseEnSilencio: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.habilidadesPorcentaje.esconderseEnLasSombras} onChange={(e) => setCharacter({ ...character, habilidadesPorcentaje: { ...character.habilidadesPorcentaje, esconderseEnLasSombras: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.habilidadesPorcentaje.comprenderLenguajes} onChange={(e) => setCharacter({ ...character, habilidadesPorcentaje: { ...character.habilidadesPorcentaje, comprenderLenguajes: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.habilidadesPorcentaje.usarPergaminos} onChange={(e) => setCharacter({ ...character, habilidadesPorcentaje: { ...character.habilidadesPorcentaje, usarPergaminos: parseInt(e.target.value) || 0 } })} /></td>
            <td><input type="number" value={character.habilidadesPorcentaje.usarPergaminos} onChange={(e) => setCharacter({ ...character, habilidadesPorcentaje: { ...character.habilidadesPorcentaje, escucharRuidos: parseInt(e.target.value) || 0 } })} /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="form-group">
      <label>Habilidades de Clase:</label>
      <textarea
        value={character.habilidadesDeClase}
        onChange={(e) => setCharacter({ ...character, habilidadesDeClase: e.target.value })}
      />
    </div>

    {/* Los campos para objetos y equipo ya están implementados en el formulario actual */}
      <div className="editable-list">
        <h3>Inventario</h3>
        <div className="editable-list-items">
          {character.equipo.map((item, index) => (
            <div key={index} className="item-input-group">
              <input
                type="text"
                value={item.nombre}
                onChange={(e) => {
                  const newEquipo = [...character.equipo];
                  newEquipo[index].nombre = e.target.value;
                  setCharacter({ ...character, equipo: newEquipo });
                }}
                placeholder="Nombre del objeto"
              />
              <textarea
                value={item.descripcion}
                onChange={(e) => {
                  const newEquipo = [...character.equipo];
                  newEquipo[index].descripcion = e.target.value;
                  setCharacter({ ...character, equipo: newEquipo });
                }}
                placeholder="Descripción del objeto"
              />
              <input
                type="number"
                value={item.bonificadorArmadura || 0}
                onChange={(e) => {
                  const newEquipo = [...character.equipo];
                  newEquipo[index].bonificadorArmadura = parseInt(e.target.value) || 0;
                  setCharacter({ ...character, equipo: newEquipo });
                }}
                placeholder="Bonificador de Armadura"
                aria-label="Bonificador de Armadura del objeto"
              />
              <small>Bonificación que este objeto otorga a la Clase de Armadura.</small>
              <input
                type="number"
                value={item.bonificadorAtaque || 0}
                onChange={(e) => {
                  const newEquipo = [...character.equipo];
                  newEquipo[index].bonificadorAtaque = parseInt(e.target.value) || 0;
                  setCharacter({ ...character, equipo: newEquipo });
                }}
                placeholder="Bonificador de Ataque"
                aria-label="Bonificador de Ataque del objeto"
              />
              <small>Bonificación que este objeto otorga al Ataque del personaje.</small>
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
            <input
              type="number"
              value={newItemArmorBonus}
              onChange={(e) => setNewItemArmorBonus(parseInt(e.target.value) || 0)}
              placeholder="Bonificador de Armadura"
            />
            <input
              type="number"
              value={newItemAttackBonus}
              onChange={(e) => setNewItemAttackBonus(parseInt(e.target.value) || 0)}
              placeholder="Bonificador de Ataque"
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


