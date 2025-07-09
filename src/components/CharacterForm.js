import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './CharacterForm.css';
import characterData from '../data/characterData.json';

const { characteristicsTooltips, classDescriptions, characterClasses } = characterData;

const initialCharacter = {
  nombre: '',
  jugador:'',
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
  const [currentStep, setCurrentStep] = useState(1);
  const [newItem, setNewItem] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [modificadores, setModificadores] = useState({ FUE: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 });
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemArmorBonus, setNewItemArmorBonus] = useState(0);
  const [newItemAttackBonus, setNewItemAttackBonus] = useState(0);
  const [requirementsError, setRequirementsError] = useState('');
  const [failedRequirements, setFailedRequirements] = useState([]);

  // Función para validar requisitos de clase
  const validateClassRequirements = (className, characteristics) => {
    if (!className || !classDescriptions[className]) {
      setRequirementsError('');
      setFailedRequirements([]);
      return;
    }

    const requirements = classDescriptions[className].detalles.requisitos;
    if (requirements === 'Ninguno') {
      setRequirementsError('');
      setFailedRequirements([]);
      return;
    }

    const failed = [];
    const reqParts = requirements.split(',').map(req => req.trim());
    
    reqParts.forEach(req => {
      if (req.includes(' y ')) {
        // Manejar requisitos múltiples con "y"
        const multiReqs = req.split(' y ').map(r => r.trim());
        multiReqs.forEach(singleReq => {
          const match = singleReq.match(/(\w+)\s+(\d+)/);
          if (match) {
            const [, stat, minValue] = match;
            if (characteristics[stat] < parseInt(minValue)) {
              failed.push(stat);
            }
          }
        });
      } else {
        // Manejar requisito simple
        const match = req.match(/(\w+)\s+(\d+)/);
        if (match) {
          const [, stat, minValue] = match;
          if (characteristics[stat] < parseInt(minValue)) {
            failed.push(stat);
          }
        }
      }
    });

    setFailedRequirements([...new Set(failed)]); // Eliminar duplicados
    
    if (failed.length > 0) {
      setRequirementsError(`No se cumplen los requisitos para la clase ${className}. Características insuficientes: ${failed.join(', ')}`);
    } else {
      setRequirementsError('');
    }
  };

  // Efecto para validar requisitos cuando cambian las características o la clase
  useEffect(() => {
    validateClassRequirements(character.clase, character.caracteristicas);
  }, [
    character.clase, 
    character.caracteristicas.FUE,
    character.caracteristicas.DES,
    character.caracteristicas.CON,
    character.caracteristicas.INT,
    character.caracteristicas.SAB,
    character.caracteristicas.CAR
  ]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCharacter({
        ...character,
        [parent]: {
          ...character[parent],
          [child]: value
        }
      });
    } else {
      setCharacter({ ...character, [name]: value });
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validar que los campos obligatorios del paso 1 estén completos
      if (!character.nombre || !character.jugador || !character.clase) {
        alert('Por favor completa todos los campos obligatorios (Nombre, Jugador y Clase)');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
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
    setCurrentStep(1); // Volver al paso 1 después de guardar
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

  const renderStep1 = () => {
    return (
      <>
        <h2>Paso 1: Información Básica</h2>
        
        <div className="form-group">
          <label htmlFor="nombre">Nombre del Personaje:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={character.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="jugador">Jugador:</label>
          <input
            type="text"
            id="jugador"
            name="jugador"
            value={character.jugador}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="clase">Clase:</label>
          <select
            id="clase"
            name="clase"
            value={character.clase}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una clase</option>
            {characterClasses.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        {character.clase && classDescriptions[character.clase] && (
          <div className="class-details">
            <h3>Detalles de la Clase</h3>
            <p><strong>Descripción:</strong> {classDescriptions[character.clase].descripcion}</p>
            <p><strong>Requisitos:</strong> {classDescriptions[character.clase].detalles.requisitos}</p>
            <p><strong>Característica Principal:</strong> {classDescriptions[character.clase].detalles.caracteristicaPrincipal}</p>
            <p><strong>Dado de Golpe:</strong> {classDescriptions[character.clase].detalles.dadoGolpe}</p>
            <p><strong>Nivel Máximo:</strong> {classDescriptions[character.clase].detalles.nivelMaximo}</p>
          </div>
        )}

        {requirementsError && (
          <div className="requirements-error">
            {requirementsError}
          </div>
        )}

        <div className="characteristics-section">
          <h3>Características</h3>
          <div className="characteristics-grid">
            {Object.keys(character.caracteristicas).map((stat) => (
              <div key={stat} className="characteristic-item">
                <label
                  data-tooltip-id={`tooltip-${stat}`}
                  data-tooltip-content={characteristicsTooltips[stat]}
                >
                  {stat}:
                </label>
                <Tooltip id={`tooltip-${stat}`} />
                <div className="characteristic-controls">
                  <input
                    type="number"
                    value={character.caracteristicas[stat]}
                    onChange={(e) => {
                      const newCharacter = { ...character };
                      newCharacter.caracteristicas[stat] = parseInt(e.target.value) || 0;
                      newCharacter.bonificadores[stat] = calculateBonus(parseInt(e.target.value) || 0);
                      setCharacter(newCharacter);
                    }}
                    className={failedRequirements.includes(stat) ? 'failed-requirement' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => handleRoll(stat)}
                    className="roll-button"
                  >
                    🎲
                  </button>
                  <span className="modifier">
                    Mod: {character.bonificadores[stat] >= 0 ? '+' : ''}{character.bonificadores[stat]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button type="button" onClick={handleNextStep} className="next-button">
            Siguiente
          </button>
        </div>
      </>
    );
  };

  const renderStep2 = () => {
    return (
      <>
        <h2>Paso 2: Detalles del Personaje</h2>
        
        <div className="form-group">
          <label htmlFor="puntosGolpe">Puntos de Golpe:</label>
          <input
            type="number"
            id="puntosGolpe"
            name="puntosGolpe"
            value={character.puntosGolpe}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="claseArmadura">Clase de Armadura:</label>
          <input
            type="number"
            id="claseArmadura"
            name="claseArmadura"
            value={character.claseArmadura}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="idiomas">Idiomas:</label>
          <textarea
            id="idiomas"
            name="idiomas"
            value={character.idiomas}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="habilidadesDeClase">Habilidades de Clase:</label>
          <textarea
            id="habilidadesDeClase"
            name="habilidadesDeClase"
            value={character.habilidadesDeClase}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="skills-section">
          <h3>Habilidades Personalizadas</h3>
          {character.habilidades.map((skill, index) => (
            <div key={index} className="skill-item">
              <input
                type="text"
                value={skill.nombre}
                onChange={(e) => {
                  const newHabilidades = [...character.habilidades];
                  newHabilidades[index].nombre = e.target.value;
                  setCharacter({ ...character, habilidades: newHabilidades });
                }}
                placeholder="Nombre de la habilidad"
              />
              <input
                type="text"
                value={skill.descripcion}
                onChange={(e) => {
                  const newHabilidades = [...character.habilidades];
                  newHabilidades[index].descripcion = e.target.value;
                  setCharacter({ ...character, habilidades: newHabilidades });
                }}
                placeholder="Descripción de la habilidad"
              />
              <button type="button" onClick={() => handleRemoveSkill(index)}>
                Eliminar
              </button>
            </div>
          ))}
          <div className="add-skill">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Nombre de nueva habilidad"
            />
            <input
              type="text"
              value={newSkillDescription}
              onChange={(e) => setNewSkillDescription(e.target.value)}
              placeholder="Descripción de nueva habilidad"
            />
            <button type="button" onClick={handleAddSkill}>
              Agregar Habilidad
            </button>
          </div>
        </div>

        <div className="equipment-section">
          <h3>Equipo</h3>
          {character.equipo.map((item, index) => (
            <div key={index} className="equipment-item">
              <span>{item}</span>
              <button type="button" onClick={() => handleRemoveItem(index)}>
                Eliminar
              </button>
            </div>
          ))}
          <div className="add-equipment">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Nuevo objeto"
            />
            <button type="button" onClick={handleAddItem}>
              Agregar Objeto
            </button>
          </div>
        </div>

        <div className="navigation-buttons">
          <button type="button" onClick={handlePreviousStep} className="prev-button">
            Anterior
          </button>
          <button type="submit" className="submit-button">
            Guardar Personaje
          </button>
        </div>
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="character-form">
      <div className="step-indicator">
        <div className={`step ${currentStep === 1 ? 'active' : 'completed'}`}>1</div>
        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>2</div>
      </div>
      
      {currentStep === 1 ? renderStep1() : renderStep2()}
    </form>
  );
};

export default CharacterForm;


