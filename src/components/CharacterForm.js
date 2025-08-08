import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './CharacterForm.css';
import characterData from '../data/characterData.json';
import equipmentData from '../data/equipment.json';
import { 
  roll4d6DropLowest, 
  calculateAttributeBonus, 
  rollHitPoints as rollHitPointsUtil // Importar con alias para evitar conflicto
} from '../utils/diceUtils';

const { characteristicsTooltips, classDescriptions, characterClasses } = characterData;
const { armaduras, equipo, armas } = equipmentData;

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
  armadura: 'Sin armadura',
  escudo: false,
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
    equipoSeleccionado: [],
  equipoPersonalizado: [],
  objetos: [],
  equipo: []
};

const CharacterForm = ({ onSaveCharacter }) => {
  const [character, setCharacter] = useState(initialCharacter);
  const [currentStep, setCurrentStep] = useState(1);
  const [newItem, setNewItem] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [requirementsError, setRequirementsError] = useState('');
  const [failedRequirements, setFailedRequirements] = useState([]);
  const [suggestedClasses, setSuggestedClasses] = useState([]);
  const [nuevoEquipo, setNuevoEquipo] = useState({
  nombre: '',
  coste: '',
  peso: ''
});
const [mostrarFormularioEquipo, setMostrarFormularioEquipo] = useState(false);
const handleAgregarEquipoPredefinido = (nombreEquipo) => {
  const equipment = equipo[nombreEquipo];
  if (equipment && !character.equipoSeleccionado.find(item => item.nombre === nombreEquipo)) {
    setCharacter({
      ...character,
      equipoSeleccionado: [...character.equipoSeleccionado, equipment]
    });
  }
};

const handleAgregarEquipoPersonalizado = () => {
  if (nuevoEquipo.nombre.trim()) {
    const equipoCompleto = {
      nombre: nuevoEquipo.nombre,
      coste: nuevoEquipo.coste || '0 mo',
      peso: nuevoEquipo.peso || '0 Kg'
    };
    
    setCharacter({
      ...character,
      equipoPersonalizado: [...character.equipoPersonalizado, equipoCompleto]
    });
    
    setNuevoEquipo({ nombre: '', coste: '', peso: '' });
    setMostrarFormularioEquipo(false);
  }
};

const handleEliminarEquipo = (index, tipo) => {
  if (tipo === 'predefinido') {
    setCharacter({
      ...character,
      equipoSeleccionado: character.equipoSeleccionado.filter((_, i) => i !== index)
    });
  } else {
    setCharacter({
      ...character,
      equipoPersonalizado: character.equipoPersonalizado.filter((_, i) => i !== index)
    });
  }
};

  // Función para verificar si todas las características han sido tiradas
  const allCharacteristicsRolled = () => {
    return Object.values(character.caracteristicas).every(value => value > 0);
  };

  // Función para calcular puntuación de una clase basada en las características
  const calculateClassScore = (className, characteristics) => {
    const classData = classDescriptions[className];
    if (!classData) return 0;

    let score = 0;
    const requirements = classData.detalles.requisitos;
    const primaryStats = classData.detalles.caracteristicaPrincipal;

    // Verificar si cumple los requisitos mínimos
    if (requirements !== 'Ninguno') {
      const reqParts = requirements.split(',').map(req => req.trim());
      let meetsRequirements = true;
      
      reqParts.forEach(req => {
        if (req.includes(' y ')) {
          const multiReqs = req.split(' y ').map(r => r.trim());
          multiReqs.forEach(singleReq => {
            const match = singleReq.match(/(\w+)\s+(\d+)/);
            if (match) {
              const [, stat, minValue] = match;
              if (characteristics[stat] < parseInt(minValue)) {
                meetsRequirements = false;
              }
            }
          });
        } else {
          const match = req.match(/(\w+)\s+(\d+)/);
          if (match) {
            const [, stat, minValue] = match;
            if (characteristics[stat] < parseInt(minValue)) {
              meetsRequirements = false;
            }
          }
        }
      });
      
      if (!meetsRequirements) return 0; // No cumple requisitos
    }

    // Bonificar por características principales
    if (primaryStats.includes('Fuerza')) score += characteristics.FUE * 2;
    if (primaryStats.includes('Destreza')) score += characteristics.DES * 2;
    if (primaryStats.includes('Constitución')) score += characteristics.CON * 2;
    if (primaryStats.includes('Inteligencia')) score += characteristics.INT * 2;
    if (primaryStats.includes('Sabiduría')) score += characteristics.SAB * 2;
    if (primaryStats.includes('Carisma')) score += characteristics.CAR * 2;

    // Bonificar por características altas en general
    score += Object.values(characteristics).reduce((sum, value) => sum + value, 0);

    return score;
  };

  // Función para obtener clases sugeridas
  const getSuggestedClasses = (characteristics) => {
    const classScores = characterClasses.map(className => ({
      name: className,
      score: calculateClassScore(className, characteristics)
    }));

    // Filtrar clases que cumplen requisitos y ordenar por puntuación
    const validClasses = classScores
      .filter(classItem => classItem.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 clases sugeridas

    return validClasses;
  };

  // Función para seleccionar una clase sugerida
  const selectSuggestedClass = (className) => {
    setCharacter({ ...character, clase: className });
    setSuggestedClasses([]);
  };

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

  // Función para calcular la clase de armadura
  const calculateArmorClass = (armadura, escudo, dexModifier) => {
    const armorData = armaduras[armadura];
    if (!armorData) return 10;
    
    let ca = armorData.ca;
    
    // Restar el modificador de destreza (porque es negativo en el sistema)
    ca = ca - dexModifier;
    
    // Si tiene escudo, restar 1 adicional
    if (escudo) {
      ca = ca - 1;
    }
    
    return ca;
  };

  // useEffect para recalcular CA cuando cambie armadura, escudo o destreza
  useEffect(() => {
    const newCA = calculateArmorClass(
      character.armadura,
      character.escudo,
      character.bonificadores.DES
    );
    
    if (newCA !== character.claseArmadura) {
      setCharacter(prev => ({
        ...prev,
        claseArmadura: newCA
      }));
    }
  }, [character.armadura, character.escudo, character.bonificadores.DES]);

  // Efecto para actualizar sugerencias cuando cambian las características
  useEffect(() => {
    if (allCharacteristicsRolled() && !character.clase) {
      const suggestions = getSuggestedClasses(character.caracteristicas);
      setSuggestedClasses(suggestions);
    } else {
      setSuggestedClasses([]);
    }
  }, [
    character.caracteristicas.FUE,
    character.caracteristicas.DES,
    character.caracteristicas.CON,
    character.caracteristicas.INT,
    character.caracteristicas.SAB,
    character.caracteristicas.CAR,
    character.clase
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

  // Reemplazar la función rollDice existente
  const handleRoll = (stat, modifier = 0) => {
    const result = roll4d6DropLowest() + parseInt(modifier);
    const newCharacter = { ...character };
    newCharacter.caracteristicas[stat] = result;
    newCharacter.bonificadores[stat] = calculateAttributeBonus(result);
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
  const rollHitPoints = () => {
    if (!character.clase || !classDescriptions[character.clase]) {
      alert('Primero debes seleccionar una clase');
      return;
    }

    const hitDie = classDescriptions[character.clase].detalles.dadoGolpe;
    let diceSize = 4; // Por defecto d4
    
    // Extraer el tamaño del dado del string (ej: "1d6" -> 6)
    const match = hitDie.match(/1d(\d+)/);
    if (match) {
      diceSize = parseInt(match[1]);
    }
    
    // Tirar el dado y sumar 1
    const roll = Math.floor(Math.random() * diceSize) + 1;
    const hitPoints = roll + 1;
    
    setCharacter({ ...character, puntosGolpe: hitPoints });
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

        {/* Sección de clases sugeridas - ahora aparece después de las características */}
        {suggestedClasses.length > 0 && (
          <div className="suggested-classes">
            <h3>🎯 Clases Recomendadas</h3>
            <p>Basado en tus características, estas clases serían ideales para tu personaje:</p>
            <div className="suggestions-grid">
              {suggestedClasses.map((classItem, index) => (
                <div key={classItem.name} className="suggestion-card">
                  <div className="suggestion-rank">#{index + 1}</div>
                  <h4>{classItem.name}</h4>
                  <p>{classDescriptions[classItem.name]?.descripcion}</p>
                  <div className="suggestion-details">
                    <small>
                      <strong>Requisitos:</strong> {classDescriptions[classItem.name]?.detalles.requisitos}<br/>
                      <strong>Característica Principal:</strong> {classDescriptions[classItem.name]?.detalles.caracteristicaPrincipal}
                    </small>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => selectSuggestedClass(classItem.name)}
                    className="select-suggestion-btn"
                  >
                    Seleccionar esta clase
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
          <div className="hit-points-controls">
            <input
              type="number"
              id="puntosGolpe"
              name="puntosGolpe"
              value={character.puntosGolpe}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={rollHitPoints}
              className="roll-button"
              disabled={!character.clase}
              title={character.clase ? `Tirar ${classDescriptions[character.clase]?.detalles.dadoGolpe} + 1` : 'Selecciona una clase primero'}
            >
              🎲
            </button>
            {character.clase && (
              <span className="hit-die-info">
                {classDescriptions[character.clase]?.detalles.dadoGolpe} + 1
              </span>
            )}
          </div>
        </div>

        <div className="armor-section">
          <h3>Armadura y Protección</h3>
          
          <div className="form-group">
            <label htmlFor="armadura">Tipo de Armadura:</label>
            <select
              id="armadura"
              name="armadura"
              value={character.armadura}
              onChange={handleChange}
              className="armor-selector"
            >
              {Object.keys(armaduras).map(armorName => (
                <option key={armorName} value={armorName}>
                  {armorName}
                </option>
              ))}
            </select>
            {character.armadura && character.armadura !== 'Sin armadura' && (
              <div className="armor-details">
                <small>
                  Peso: {armaduras[character.armadura].peso} | 
                  Coste: {armaduras[character.armadura].coste}|
                  CA: {armaduras[character.armadura].ca}
                </small>
              </div>
            )}
          </div>

          <div className="form-group">
    <label className="checkbox-label">
    <input
      type="checkbox"
      name="escudo"
      checked={character.escudo}
      onChange={(e) => {
        setCharacter({
          ...character,
          escudo: e.target.checked
        });
      }}
    />
    <span>             Escudo (+1 CA, 10 mo, 5 Kg)</span>
  </label>
          </div>

          <div className="form-group">
            <label htmlFor="claseArmadura">Clase de Armadura (Calculada):</label>
            <div className="armor-class-display">
              <input
                type="number"
                id="claseArmadura"
                name="claseArmadura"
                value={character.claseArmadura}
                readOnly
                className="calculated-field"
              />
              <div className="ca-breakdown">
                <small>
                  CA Base: {armaduras[character.armadura]?.ca || 10} - 
                  Mod DES: {character.bonificadores.DES} 
                  {character.escudo ? '- Escudo: 1' : ''} = 
                  {character.claseArmadura}
                </small>
              </div>
            </div>
          </div>
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
          <div className="form-group">
  <label>Equipo Adicional:</label>
  
  {/* Selector de equipo predefinido */}
  <div className="equipment-selector">
    <select 
      onChange={(e) => {
        if (e.target.value) {
          handleAgregarEquipoPredefinido(e.target.value);
          e.target.value = '';
        }
      }}
      className="form-control"
    >
      <option value="">Seleccionar equipo predefinido...</option>
      {Object.keys(equipo).map(nombreEquipo => (
        <option key={nombreEquipo} value={nombreEquipo}>
          {nombreEquipo} ({equipo[nombreEquipo].coste}, {equipo[nombreEquipo].peso})
        </option>
      ))}
    </select>
  </div>

  {/* Botón para agregar equipo personalizado */}
  <div className="custom-equipment-controls">
    <button 
      type="button" 
      onClick={() => setMostrarFormularioEquipo(!mostrarFormularioEquipo)}
      className="btn btn-secondary"
    >
      {mostrarFormularioEquipo ? 'Cancelar' : 'Agregar Equipo Personalizado'}
    </button>
  </div>

  {/* Formulario para equipo personalizado */}
  {mostrarFormularioEquipo && (
    <div className="custom-equipment-form">
      <div className="form-row">
        <div className="form-group col-md-6">
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={nuevoEquipo.nombre}
            onChange={(e) => setNuevoEquipo({...nuevoEquipo, nombre: e.target.value})}
            className="form-control"
          />
        </div>
        <div className="form-group col-md-3">
          <input
            type="text"
            placeholder="Coste (ej: 5 mo)"
            value={nuevoEquipo.coste}
            onChange={(e) => setNuevoEquipo({...nuevoEquipo, coste: e.target.value})}
            className="form-control"
          />
        </div>
        <div className="form-group col-md-3">
          <input
            type="text"
            placeholder="Peso (ej: 2 Kg)"
            value={nuevoEquipo.peso}
            onChange={(e) => setNuevoEquipo({...nuevoEquipo, peso: e.target.value})}
            className="form-control"
          />
        </div>
      </div>
      <button 
        type="button" 
        onClick={handleAgregarEquipoPersonalizado}
        className="btn btn-primary"
        disabled={!nuevoEquipo.nombre.trim()}
      >
        Agregar Equipo
      </button>
    </div>
  )}

  {/* Lista de equipo seleccionado */}
  <div className="equipment-list">
    <h4>Equipo Seleccionado:</h4>
    
    {/* Equipo predefinido */}
    {character.equipoSeleccionado.length > 0 && (
      <div className="equipment-section">
        <h5>Equipo Predefinido:</h5>
        {character.equipoSeleccionado.map((equipo, index) => (
          <div key={index} className="equipment-item">
            <span className="equipment-name">{equipo.nombre}</span>
            <span className="equipment-details">({equipo.coste}, {equipo.peso})</span>
            <button 
              type="button" 
              onClick={() => handleEliminarEquipo(index, 'predefinido')}
              className="btn btn-sm btn-danger"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
    
    {/* Equipo personalizado */}
    {character.equipoPersonalizado.length > 0 && (
      <div className="equipment-section">
        <h5>Equipo Personalizado:</h5>
        {character.equipoPersonalizado.map((equipo, index) => (
          <div key={index} className="equipment-item">
            <span className="equipment-name">{equipo.nombre}</span>
            <span className="equipment-details">({equipo.coste}, {equipo.peso})</span>
            <button 
              type="button" 
              onClick={() => handleEliminarEquipo(index, 'personalizado')}
              className="btn btn-sm btn-danger"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
    
    {character.equipoSeleccionado.length === 0 && character.equipoPersonalizado.length === 0 && (
      <p className="no-equipment">No hay equipo seleccionado</p>
    )}
  </div>
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
