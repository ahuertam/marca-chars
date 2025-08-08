import React, { useState, useEffect } from 'react';
import adventureData from '../data/adventure.json';
import characterData from '../data/characterData.json';
import { 
  rollDice, 
  roll3d6, 
  rollAttributeDice, 
  rollHitPoints, // Cambiar rollHitPointsUtil por rollHitPoints
  createRollResult 
} from '../utils/diceUtils';
import './CharacterAdventure.css';

const CharacterAdventure = ({ onSaveCharacter }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [character, setCharacter] = useState({
    nombre: '',
    clase: '',
    atributos: {
      FUE: 10,
      DES: 10,
      CON: 10,
      INT: 10,
      SAB: 10,
      CAR: 10
    },
    puntosVida: 0,
    nivel: 1,
    experiencia: 0,
    oro: 0,
    equipoSeleccionado: [],
    historia: [],
    origen: '',
    personalidad: '',
    herencia: ''
  });
  const [diceResult, setDiceResult] = useState(null);
  const [showDice, setShowDice] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]));

  const rollDice = (sides = 20) => {
    const result = Math.floor(Math.random() * sides) + 1;
    setDiceResult(result);
    setShowDice(true);
    setTimeout(() => setShowDice(false), 2000);
    return result;
  };

  const roll3d6 = () => {
    return Math.floor(Math.random() * 6) + 1 + 
           Math.floor(Math.random() * 6) + 1 + 
           Math.floor(Math.random() * 6) + 1;
  };

  const rollAttributeDice = (formula) => {
    if (formula === '3d6') {
      return roll3d6();
    } else if (formula.includes('3d6+')) {
      const bonus = parseInt(formula.split('+')[1]);
      return roll3d6() + bonus;
    }
    return 10; // valor por defecto
  };

  const applyEffects = (effects, rollResult = null) => {
    setCharacter(prev => {
      const newCharacter = { ...prev };
      
      // Apply attribute changes
      if (effects.attributes) {
        Object.entries(effects.attributes).forEach(([attr, value]) => {
          if (value === 'roll3d6') {
            newCharacter.atributos[attr] = roll3d6();
          } else if (typeof value === 'string' && value.startsWith('+')) {
            newCharacter.atributos[attr] += parseInt(value.substring(1));
          } else {
            newCharacter.atributos[attr] = value;
          }
        });
      }
      
      // Apply gold changes
      if (effects.gold) {
        newCharacter.oro += effects.gold;
      }
      
      // Apply experience changes
      if (effects.experience) {
        newCharacter.experiencia += effects.experience;
      }
      
      // Apply hit points - FIX: Check if hitPoints is string before using includes
      if (effects.hitPoints) {
        if (typeof effects.hitPoints === 'string' && effects.hitPoints.includes('3d6')) {
          const bonus = parseInt(effects.hitPoints.split('+')[1] || '0');
          newCharacter.puntosVida += roll3d6() + bonus;
        } else {
          newCharacter.puntosVida += parseInt(effects.hitPoints);
        }
      }
      
      // Apply equipment
      if (effects.equipment) {
        newCharacter.equipoSeleccionado = [...newCharacter.equipoSeleccionado, ...effects.equipment];
      }
      
      // Apply history
      if (effects.history) {
        let historyText = effects.history;
        if (rollResult) {
          historyText = historyText.replace('{roll}', rollResult.total)
                                 .replace('{rollValue}', rollResult.roll)
                                 .replace('{bonus}', rollResult.bonus);
        }
        newCharacter.historia = [...newCharacter.historia, historyText];
      }
      
      return newCharacter;
    });
  };

  const handleChoice = (choice) => {
    let nextStep = choice.nextStep || currentStep + 1;
    
    if (choice.type === 'attribute_roll') {
      const roll = rollDice(20);
      const currentAttr = character.atributos[currentStepData.attribute] || 10;
      const bonus = Math.floor((currentAttr - 10) / 2);
      const total = roll + bonus;
      const rollResult = { roll, bonus, total };
      
      let newAttributeValue;
      if (total >= choice.difficulty) {
        // Éxito: mejor resultado
        newAttributeValue = rollAttributeDice(choice.effects.success.attributes[currentStepData.attribute]);
        applyEffects(choice.effects.success, rollResult);
      } else {
        // Fallo: resultado estándar
        newAttributeValue = rollAttributeDice(choice.effects.failure.attributes[currentStepData.attribute]);
        applyEffects(choice.effects.failure, rollResult);
      }
      
      // Actualizar la característica específica
      setCharacter(prev => ({
        ...prev,
        atributos: {
          ...prev.atributos,
          [currentStepData.attribute]: newAttributeValue
        }
      }));
    } else if (choice.type === 'skill_check') {
      const roll = rollDice(20);
      const bonus = Math.floor((character.atributos[choice.skill] - 10) / 2);
      const total = roll + bonus;
      const rollResult = { roll, bonus, total };
      
      if (total >= choice.difficulty) {
        applyEffects(choice.effects.success, rollResult);
      } else {
        applyEffects(choice.effects.failure, rollResult);
      }
    } else if (choice.type === 'combined_check') {
      const roll = rollDice(20);
      const bonus1 = Math.floor((character.atributos[choice.skills[0]] - 10) / 2);
      const bonus2 = Math.floor((character.atributos[choice.skills[1]] - 10) / 2);
      const total = roll + bonus1 + bonus2;
      const rollResult = { roll, bonus: bonus1 + bonus2, total };
      
      if (total >= choice.difficulty) {
        applyEffects(choice.effects.success, rollResult);
      } else {
        applyEffects(choice.effects.failure, rollResult);
      }
    } else if (choice.type === 'final_challenge') {
      const roll = rollDice(20);
      const rollResult = { roll, bonus: 0, total: roll };
      
      if (roll >= choice.difficulty) {
        applyEffects(choice.effects.success, rollResult);
      } else {
        applyEffects(choice.effects.failure, rollResult);
      }
    } else if (choice.type === 'class_selection' || choice.type === 'race_selection') {
      // Check requirements
      if (choice.requirements) {
        const meetsRequirements = Object.entries(choice.requirements).every(
          ([attr, minValue]) => character.atributos[attr] >= minValue
        );
        
        if (!meetsRequirements) {
          setCharacter(prev => ({
            ...prev,
            historia: [...prev.historia, choice.failureMessage]
          }));
          return;
        }
      }
      
      setCharacter(prev => ({
        ...prev,
        clase: choice.class
      }));
      
      applyEffects(choice.effects);
    } else {
      // Handle other choice types (origin, personality, heritage, etc.)
      if (choice.type === 'origin') {
        setCharacter(prev => ({ ...prev, origen: choice.value }));
      } else if (choice.type === 'personality') {
        setCharacter(prev => ({ ...prev, personalidad: choice.value }));
      } else if (choice.type === 'heritage') {
        setCharacter(prev => ({ ...prev, herencia: choice.value }));
      }
      
      applyEffects(choice.effects);
    }
    
    setVisitedSteps(prev => new Set([...prev, nextStep]));
    setCurrentStep(nextStep);
  };

  const handleNameSubmit = (name) => {
    // Obtener información de la clase del personaje
    const classInfo = characterData.classDescriptions[character.clase];
    
    // Calcular tiradas de salvación según clase y nivel
    const getSavingThrows = (className, level) => {
      const classData = characterData.classDescriptions[className];
      if (!classData || !classData.tiradasSalvacionPorNivel) return {};
      
      // Determinar el rango de nivel apropiado
      const levelRanges = Object.keys(classData.tiradasSalvacionPorNivel);
      let appropriateRange = levelRanges[0]; // Por defecto el primer rango
      
      for (const range of levelRanges) {
        if (range.includes('-')) {
          const [min, max] = range.split('-').map(n => parseInt(n));
          if (level >= min && level <= max) {
            appropriateRange = range;
            break;
          }
        } else if (range.includes('+')) {
          const min = parseInt(range.replace('+', ''));
          if (level >= min) {
            appropriateRange = range;
          }
        } else if (parseInt(range) === level) {
          appropriateRange = range;
          break;
        }
      }
      
      return classData.tiradasSalvacionPorNivel[appropriateRange] || {};
    };
    
    const savingThrows = getSavingThrows(character.clase, character.nivel);
    
    const finalCharacter = {
      ...character,
      nombre: name,
       // Cambiar estructura para compatibilidad con CharacterSheet
      caracteristicas: character.atributos, // Cambiar de atributos a caracteristicas
      puntosGolpe: character.puntosVida,    // Cambiar de puntosVida a puntosGolpe
      historia: [...character.historia, adventureData.messages.finalHistoryEntry.replace('{name}', name)],
      // Agregar tiradas de salvación
      tiradasSalvacion: {
        venenoOMuerte: savingThrows.venenoOMuerte || 0,
        varitasMagicas: savingThrows.varitasYCetros || 0,
        petrificacionOParalisis: savingThrows.petrificacionOParalisis || 0,
        alientoDedragon: savingThrows.armasDeAliento || 0,
        sortilegiosVarasYBaculos: savingThrows.conjurosYArmasMagicas || 0
      },
      // Agregar modificadores de salvación (inicialmente 0)
      modificadoresSalvacion: {
        venenoOMuerte: 0,
        varitasMagicas: 0,
        petrificacionOParalisis: 0,
        alientoDedragon: 0,
        sortilegiosVarasYBaculos: 0
      },
      // Agregar características de clase
      dadoGolpe: classInfo?.detalles?.dadoGolpe || '1d6',
      caracteristicaPrincipal: classInfo?.detalles?.caracteristicaPrincipal || '',
      requisitos: classInfo?.detalles?.requisitos || '',
      nivelMaximo: classInfo?.detalles?.nivelMaximo || 'Ninguno'
    };
    
    onSaveCharacter(finalCharacter);
  };

  // Function to parse requirements string
  const parseRequirements = (reqString) => {
    if (reqString === 'Ninguno') return {};
    
    const requirements = {};
    const parts = reqString.split(',').map(part => part.trim());
    
    parts.forEach(part => {
      if (part.includes(' y ')) {
        // Handle "INT 12 y DES 13"
        const subParts = part.split(' y ').map(p => p.trim());
        subParts.forEach(subPart => {
          const [attr, value] = subPart.split(' ');
          requirements[attr] = parseInt(value);
        });
      } else {
        // Handle "FUE 12"
        const [attr, value] = part.split(' ');
        if (attr && value) {
          requirements[attr] = parseInt(value);
        }
      }
    });
    
    return requirements;
  };

  // Function to check if character meets class requirements
  const meetsRequirements = (className) => {
    const classInfo = characterData.classDescriptions[className];
    if (!classInfo) return false;
    
    const requirements = parseRequirements(classInfo.detalles.requisitos);
    
    return Object.entries(requirements).every(
      ([attr, minValue]) => character.atributos[attr] >= minValue
    );
  };

  // Function to get available classes based on current attributes
  const getAvailableClasses = () => {
    const availableClasses = [];
    
    Object.keys(characterData.classDescriptions).forEach(className => {
      if (meetsRequirements(className)) {
        const classInfo = characterData.classDescriptions[className];
        availableClasses.push({
          name: className,
          description: classInfo.descripcion,
          requirements: classInfo.detalles.requisitos,
          primaryStat: classInfo.detalles.caracteristicaPrincipal,
          hitDie: classInfo.detalles.dadoGolpe
        });
      }
    });
    
    return availableClasses;
  };

  const currentStepData = adventureData.adventureSteps.find(step => step.id === currentStep);

  if (!currentStepData) {
    return <div>{adventureData.messages.adventureCompleted}</div>;
  }

  // In the render section, add this logic for dynamic class selection
  if (currentStepData.type === 'dynamic_class_selection') {
    const availableClasses = getAvailableClasses();
    
    return (
      <div className="adventure-container">
        <div className="adventure-content">
          <div className="story-section">
            <h2 className="adventure-title">{currentStepData.title}</h2>
            <p className="adventure-text">{currentStepData.text}</p>
  
            {availableClasses.length > 0 ? (
              <div className="choices-container">
                {availableClasses.map((classOption, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCharacter(prev => {
                        const classInfo = characterData.classDescriptions[classOption.name];
                        const hitDie = classInfo?.detalles?.dadoGolpe || '1d6';
                        
                        // Extraer el tamaño del dado
                        const match = hitDie.match(/1d(\d+)/);
                        const diceSize = match ? parseInt(match[1]) : 6;
                        
                        // Tirar el dado y sumar 1 (como en CharacterForm)
                        const roll = Math.floor(Math.random() * diceSize) + 1;
                        // Eliminar las funciones rollDice, roll3d6, rollAttributeDice duplicadas
                        // ya que ahora se importan de utils
                        
                        // Actualizar la función que maneja los puntos de golpe
                        const hitPoints = rollHitPoints(hitDie); // Cambiar rollHitPointsUtil por rollHitPoints
                        
                        return {
                          ...prev,
                          clase: classOption.name,
                          puntosVida: hitPoints,
                          historia: [...prev.historia, `Te conviertes en ${classOption.name}: ${classInfo.description}. Vitalidad: ${hitPoints} PV`]
                        };
                      });
                      setCurrentStep(8);
                    }}
                    className="choice-btn class-choice"
                  >
                    <div className="class-name">{classOption.name}</div>
                    <div className="class-description">{classOption.description}</div>
                    <div className="class-requirements">
                      Requisitos: {classOption.requirements}
                    </div>
                    <div className="class-primary-stat">
                      Característica principal: {classOption.primaryStat}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-classes-available">
                <p>{adventureData.messages.noClassesAvailable}</p>
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="choice-btn"
                >
                  Continuar entrenando
                </button>
              </div>
            )}
          </div>
          
          {/* Character info section */}
          <div className="character-info">
            {character.historia.length > 0 && (
              <div className="character-history">
                <h3>{adventureData.messages.characterHistory}</h3>
                <ul>
                  {character.historia.slice(-4).map((event, index) => (
                    <li key={index}>{event}</li>
                  ))}
                </ul>
              </div>
            )}
  
            <div className="character-preview">
              <h3>{adventureData.messages.currentStatus}</h3>
              <div className="stats-grid">
                <div>Clase: {character.clase || 'Sin definir'}</div>
                <div>Origen: {character.origen || 'Desconocido'}</div>
                <div>Herencia: {character.herencia || 'Sin determinar'}</div>
                <div>Personalidad: {character.personalidad || 'En desarrollo'}</div>
                <div>Oro: {character.oro}</div>
                <div>Experiencia: {character.experiencia}</div>
                <div>PV: {character.puntosVida}</div>
                <div>FUE: {character.atributos.FUE}</div>
                <div>DES: {character.atributos.DES}</div>
                <div>CON: {character.atributos.CON}</div>
                <div>INT: {character.atributos.INT}</div>
                <div>SAB: {character.atributos.SAB}</div>
                <div>CAR: {character.atributos.CAR}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adventure-container">
      <div className="adventure-content">
        <div className="story-section">
          <h2 className="adventure-title">{currentStepData.title}</h2>
          <p className="adventure-text">{currentStepData.text}</p>

          {showDice && (
            <div className="dice-result">
              <div className="dice-animation">🎲</div>
              <span>Resultado: {diceResult}</span>
            </div>
          )}

          {currentStepData.isNameInput ? (
            <div className="name-input-section">
              <input
                type="text"
                placeholder={adventureData.messages.nameInputPlaceholder}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleNameSubmit(e.target.value.trim());
                  }
                }}
                className="name-input"
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  if (input.value.trim()) {
                    handleNameSubmit(input.value.trim());
                  }
                }}
                className="name-submit-btn"
              >
                {adventureData.messages.completeAdventureButton}
              </button>
            </div>
          ) : (
            <div className="choices-container">
              {currentStepData.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  className="choice-btn"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="character-info">
          {character.historia.length > 0 && (
            <div className="character-history">
              <h3>{adventureData.messages.characterHistory}</h3>
              <ul>
                {character.historia.slice(-4).map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="character-preview">
            <h3>{adventureData.messages.currentStatus}</h3>
            <div className="stats-grid">
              <div>Clase: {character.clase || 'Sin definir'}</div>
              <div>Origen: {character.origen || 'Desconocido'}</div>
              <div>Herencia: {character.herencia || 'Sin determinar'}</div>
              <div>Personalidad: {character.personalidad || 'En desarrollo'}</div>
              <div>Oro: {character.oro}</div>
              <div>Experiencia: {character.experiencia}</div>
              <div>PV: {character.puntosVida}</div>
              <div>FUE: {character.atributos.FUE}</div>
              <div>DES: {character.atributos.DES}</div>
              <div>CON: {character.atributos.CON}</div>
              <div>INT: {character.atributos.INT}</div>
              <div>SAB: {character.atributos.SAB}</div>
              <div>CAR: {character.atributos.CAR}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterAdventure;