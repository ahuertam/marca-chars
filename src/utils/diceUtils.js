// Utilidades para tiradas de dados y cálculos de características

/**
 * Tira 4d6 y suma los 3 más altos (método estándar para características)
 */
export const roll4d6DropLowest = () => {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => b - a);
  return rolls[0] + rolls[1] + rolls[2];
};

/**
 * Tira 3d6 estándar
 */
export const roll3d6 = () => {
  return Math.floor(Math.random() * 6) + 1 + 
         Math.floor(Math.random() * 6) + 1 + 
         Math.floor(Math.random() * 6) + 1;
};

/**
 * Tira un dado de N caras
 * @param {number} sides - Número de caras del dado
 * @returns {number} Resultado de la tirada (1 a sides)
 */
export const rollDice = (sides = 20) => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Parsea una fórmula de dado y ejecuta la tirada
 * @param {string} formula - Fórmula como "1d6", "3d6", "3d6+2", etc.
 * @returns {number} Resultado de la tirada
 */
export const rollDiceFormula = (formula) => {
  if (!formula) return 0;
  
  // Manejar fórmulas como "3d6+2" o "1d8"
  const match = formula.match(/(\d+)d(\d+)(?:\+(-?\d+))?/);
  if (!match) return 0;
  
  const numDice = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const bonus = parseInt(match[3] || 0);
  
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += rollDice(sides);
  }
  
  return total + bonus;
};

/**
 * Calcula el bonificador de característica según las reglas de D&D
 * @param {number} value - Valor de la característica
 * @returns {number} Bonificador (-3 a +3 o más)
 */
export const calculateAttributeBonus = (value) => {
  if (value <= 3) return -3;
  if (value <= 5) return -2;
  if (value <= 8) return -1;
  if (value <= 12) return 0;
  if (value <= 15) return 1;
  if (value <= 17) return 2;
  return Math.floor((value - 15) / 2) + 2;
};

/**
 * Tira puntos de golpe para una clase específica
 * @param {string} hitDie - Dado de golpe como "1d6", "1d8", etc.
 * @returns {number} Puntos de golpe (tirada + 1)
 */
export const rollHitPoints = (hitDie) => {
  if (!hitDie) return 1;
  
  // Extraer el tamaño del dado del string (ej: "1d6" -> 6)
  const match = hitDie.match(/1d(\d+)/);
  const diceSize = match ? parseInt(match[1]) : 4;
  
  // Tirar el dado y sumar 1
  const roll = rollDice(diceSize);
  return roll + 1;
};

/**
 * Maneja tiradas de atributos con fórmulas especiales
 * @param {string} formula - Fórmula como "3d6", "3d6+2", "roll3d6"
 * @returns {number} Resultado de la tirada
 */
export const rollAttributeDice = (formula) => {
  if (formula === '3d6' || formula === 'roll3d6') {
    return roll3d6();
  } else if (formula && formula.includes('3d6+')) {
    const bonus = parseInt(formula.split('+')[1]);
    return roll3d6() + bonus;
  } else if (formula && formula.includes('d')) {
    return rollDiceFormula(formula);
  }
  return 10; // valor por defecto
};

/**
 * Crea un objeto de resultado de tirada con detalles
 * @param {number} roll - Resultado del dado
 * @param {number} bonus - Bonificador aplicado
 * @returns {object} Objeto con roll, bonus y total
 */
export const createRollResult = (roll, bonus = 0) => {
  return {
    roll,
    bonus,
    total: roll + bonus
  };
};