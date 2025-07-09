import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import './CharacterSheet.css';

const CharacterSheet = ({ character, onUpdateCharacter }) => {
  const [editableCharacter, setEditableCharacter] = useState(character);
  const sheetRef = useRef(null);

  const handleChange = (field, value) => {
    const updatedCharacter = { ...editableCharacter };
    const fieldParts = field.split('.');
    if (fieldParts.length === 1) {
      updatedCharacter[field] = value;
    } else if (fieldParts.length === 2) {
      if (!updatedCharacter[fieldParts[0]]) {
        updatedCharacter[fieldParts[0]] = {};
      }
      updatedCharacter[fieldParts[0]][fieldParts[1]] = value;
    } else if (fieldParts.length === 3) {
      if (!updatedCharacter[fieldParts[0]]) {
        updatedCharacter[fieldParts[0]] = {};
      }
      if (!updatedCharacter[fieldParts[0]][fieldParts[1]]) {
        updatedCharacter[fieldParts[0]][fieldParts[1]] = {};
      }
      updatedCharacter[fieldParts[0]][fieldParts[1]][fieldParts[2]] = value;
    }
    setEditableCharacter(updatedCharacter);
    onUpdateCharacter(updatedCharacter);
  };

  const handleDownloadImage = () => {
    if (sheetRef.current) {
      html2canvas(sheetRef.current).then(canvas => {
        const link = document.createElement('a');
        link.download = `${editableCharacter.nombre || 'character'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  if (!character) return null;

// Función para calcular modificador
const getModifier = (value) => Math.floor((value - 10) / 2);
        
// Cálculo de Clase de Armadura
const calculateArmorClass = () => {
  const baseArmor = parseInt(editableCharacter.claseArmadura) || 0;
  const dexModifier = getModifier(parseInt(editableCharacter.caracteristicas?.DES) || 10);
  const shieldBonus = editableCharacter.escudo ? 1 : 0;
  const magicArmorBonus = parseInt(editableCharacter.bonificadorArmaduraMagica) || 0;
  const naturalArmor = parseInt(editableCharacter.armaduraNatural) || 0;

  let finalCA = baseArmor - dexModifier - magicArmorBonus - shieldBonus - naturalArmor;
  if (finalCA < 0) finalCA = 0;
  return finalCA;
};

// Cálculo de Bonificador de Ataque
const calculateAttackBonus = () => {
  const baseAttackBonus = parseInt(editableCharacter.bonificadorAtaqueBase) || 0;
  const strengthModifier = getModifier(parseInt(editableCharacter.caracteristicas?.FUE) || 10);
  const dexterityModifier = getModifier(parseInt(editableCharacter.caracteristicas?.DES) || 10);

  const isMelee = editableCharacter.ataqueCuerpoACuerpo;
  const isRanged = editableCharacter.ataqueProyectiles;

  let finalBA = baseAttackBonus;
  if (isMelee) {
    finalBA += strengthModifier;
  } else if (isRanged) {
    finalBA += dexterityModifier;
  }

  return finalBA;
};
  // Función para agregar una nueva arma
  const addWeapon = () => {
    const newWeapon = {
      id: Date.now(),
      nombre: '',
      totalAtaque: 0,
      fuerzaDestreza: 0,
      magiaAtaque: 0,
      ataqueBase: 0,
      totalDano: 0,
      magicaFuerza: 0,
      magiaDano: 0,
      especial: ''
    };
    
    const updatedWeapons = [...(editableCharacter.armas || []), newWeapon];
    const updatedCharacter = { ...editableCharacter, armas: updatedWeapons };
    setEditableCharacter(updatedCharacter);
    onUpdateCharacter(updatedCharacter);
  };

  // Función para eliminar un arma
  const removeWeapon = (weaponId) => {
    const updatedWeapons = editableCharacter.armas.filter(weapon => weapon.id !== weaponId);
    const updatedCharacter = { ...editableCharacter, armas: updatedWeapons };
    setEditableCharacter(updatedCharacter);
    onUpdateCharacter(updatedCharacter);
  };

  // Función para calcular el total de ataque
  const calculateAttackTotal = (weapon) => {
    return (parseInt(weapon.ataqueBase) || 0) + 
           (parseInt(weapon.fuerzaDestreza) || 0) + 
           (parseInt(weapon.magiaAtaque) || 0);
  };

  // Función para calcular el total de daño
  const calculateDamageTotal = (weapon) => {
    return (parseInt(weapon.totalDano) || 0) + 
           (parseInt(weapon.magicaFuerza) || 0) + 
           (parseInt(weapon.magiaDano) || 0);
  };
  // Agregar estas funciones junto con las otras funciones del componente

  const addSpell = () => {
    const newSpell = {
      id: Date.now(),
      nombre: '',
      nivel: 1,
      alcance: '',
      duracion: '',
      efecto: '',
      preparado: false
    };
    
    const updatedSpells = [...(editableCharacter.conjuros || []), newSpell];
    handleChange('conjuros', updatedSpells);
  };

  const removeSpell = (spellId) => {
    const updatedSpells = editableCharacter.conjuros.filter(spell => spell.id !== spellId);
    handleChange('conjuros', updatedSpells);
  };
  return (
    <div className="character-sheet" ref={sheetRef}>
      <h2>Ficha de Personaje</h2>
      <div className="character-header">
        <div className="header-row">
          <div className="field-group">
            <span className="field-label">Personaje:</span>
            <input 
              type="text" 
              className="underline-input" 
              value={editableCharacter.nombre} 
              onChange={(e) => handleChange('nombre', e.target.value)} 
            />
          </div>
          <div className="field-group">
            <span className="field-label">Jugador:</span>
            <input 
              type="text" 
              className="underline-input" 
              value={editableCharacter.jugador} 
              onChange={(e) => handleChange('jugador', e.target.value)} 
            />
          </div>
        </div>
        
        <div className="header-row">
          <div className="field-group">
            <span className="field-label">Clase:</span>
            <input 
              type="text" 
              className="underline-input" 
              value={editableCharacter.clase} 
              onChange={(e) => handleChange('clase', e.target.value)} 
            />
          </div>
          <div className="field-group">
            <span className="field-label">Origen:</span>
            <input 
              type="text" 
              className="underline-input" 
              value={editableCharacter.origen || ''} 
              onChange={(e) => handleChange('origen', e.target.value)} 
            />
          </div>
          <div className="field-group">
            <span className="field-label">Alineamiento:</span>
            <input 
              type="text" 
              className="underline-input" 
              value={editableCharacter.alineamiento || ''} 
              onChange={(e) => handleChange('alineamiento', e.target.value)} 
            />
          </div>
        </div>
        
        <div className="header-row">
          <div className="field-group">
            <span className="field-label">Nivel:</span>
            <input 
              type="number" 
              className="underline-input small" 
              value={editableCharacter.nivel || ''} 
              onChange={(e) => handleChange('nivel', e.target.value)} 
            />
          </div>
          <div className="field-group">
            <span className="field-label">Experiencia:</span>
            <input 
              type="number" 
              className="underline-input" 
              value={editableCharacter.experiencia || ''} 
              onChange={(e) => handleChange('experiencia', e.target.value)} 
            />
          </div>
          <div className="field-group">
            <span className="field-label">Siguiente nivel:</span>
            <input 
              type="number" 
              className="underline-input" 
              value={editableCharacter.siguienteNivel || ''} 
              onChange={(e) => handleChange('siguienteNivel', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <hr />
      
      <div className="main-content">
        <div className="left-column">
          <div className="characteristics-section">
            <h3 className="characteristics-title">CARACTERÍSTICAS</h3>
            <div className="characteristics-header">
              <span className="puntuacion-label">Puntuación</span>
              <span className="modificador-label">Modificador</span>
            </div>
            
            <div className="characteristic-row">
              <div className="characteristic-name">Fuerza</div>
              <input 
                type="number" 
                className="characteristic-score" 
                value={editableCharacter.caracteristicas.fue} 
                onChange={(e) => handleChange('caracteristicas.fue', e.target.value)} 
              />
              <input 
                type="number" 
                className="characteristic-modifier" 
                value={editableCharacter.bonificadores.fue} 
                readOnly 
              />
              <div className="characteristic-description">
                Al impacto, daño<br/>y abrir puertas
              </div>
            </div>
            
            <div className="characteristic-row">
              <div className="characteristic-name">Destreza</div>
              <input 
                type="number" 
                className="characteristic-score" 
                value={editableCharacter.caracteristicas.des} 
                onChange={(e) => handleChange('caracteristicas.des', e.target.value)} 
              />
              <input 
                type="number" 
                className="characteristic-modifier" 
                value={editableCharacter.bonificadores.des} 
                readOnly 
              />
              <div className="characteristic-description">
                CA y ataque<br/>con proyectiles
              </div>
            </div>
            
            <div className="characteristic-row">
              <div className="characteristic-name">Constitución</div>
              <input 
                type="number" 
                className="characteristic-score" 
                value={editableCharacter.caracteristicas.con} 
                onChange={(e) => handleChange('caracteristicas.con', e.target.value)} 
              />
              <input 
                type="number" 
                className="characteristic-modifier" 
                value={editableCharacter.bonificadores.con} 
                readOnly 
              />
              <div className="characteristic-description">
                A la tirada de<br/>Puntos de Golpe
              </div>
            </div>
            
            <div className="characteristic-row">
              <div className="characteristic-name">Inteligencia</div>
              <input 
                type="number" 
                className="characteristic-score" 
                value={editableCharacter.caracteristicas.int} 
                onChange={(e) => handleChange('caracteristicas.int', e.target.value)} 
              />
              <input 
                type="number" 
                className="characteristic-modifier" 
                value={editableCharacter.bonificadores.int} 
                readOnly 
              />
              <div className="characteristic-description">
                Para escribir y<br/>leer idiomas
              </div>
            </div>
            
            <div className="characteristic-row">
              <div className="characteristic-name">Sabiduría</div>
              <input 
                type="number" 
                className="characteristic-score" 
                value={editableCharacter.caracteristicas.sab} 
                onChange={(e) => handleChange('caracteristicas.sab', e.target.value)} 
              />
              <input 
                type="number" 
                className="characteristic-modifier" 
                value={editableCharacter.bonificadores.sab} 
                readOnly 
              />
              <div className="characteristic-description">
                A las TS contra<br/>ataques mágicos
              </div>
            </div>
            
            <div className="characteristic-row">
              <div className="characteristic-name">Carisma</div>
              <input 
                type="number" 
                className="characteristic-score" 
                value={editableCharacter.caracteristicas.car} 
                onChange={(e) => handleChange('caracteristicas.car', e.target.value)} 
              />
              <input 
                type="number" 
                className="characteristic-modifier" 
                value={editableCharacter.bonificadores.car} 
                readOnly 
              />
              <div className="characteristic-description">
                A la reacción y moral<br/>de los seguidores
              </div>
            </div>
          </div>
          
          <div className="initiative">
            <div className="initiative-title">Iniciativa</div>
            <div className="initiative-content">
              <div>
                <span>Total =</span>
                <input type="number" value={editableCharacter.iniciativaBase || 0} onChange={(e) => handleChange('iniciativaBase', e.target.value)} />
                <span>+</span>
                <input type="number" value={editableCharacter.iniciativaBonus || 0} onChange={(e) => handleChange('iniciativaBonus', e.target.value)} />
                <span>Des+Misc</span>
              </div>
            </div>
          </div>

                <div className="movement-section">
        <div className="movement-title">MOVIMIENTO</div>
        <div className="movement-content">
          <div className="movement-item">
            <label>Base:</label>
            <input 
              type="number" 
              value={editableCharacter.movimiento?.base || 0} 
              onChange={(e) => handleChange('movimiento.base', e.target.value)} 
            />
          </div>
          <div className="movement-item">
            <label>Combate:</label>
            <input 
              type="number" 
              value={editableCharacter.movimiento?.combate || 0} 
              onChange={(e) => handleChange('movimiento.combate', e.target.value)} 
            />
          </div>
          <div className="movement-item">
            <label>Carrera:</label>
            <input 
              type="number" 
              value={editableCharacter.movimiento?.carrera || 0} 
              onChange={(e) => handleChange('movimiento.carrera', e.target.value)} 
            />
          </div>
          <div className="movement-item">
            <label>Cargado:</label>
            <input 
              type="number" 
              value={editableCharacter.movimiento?.cargado || 0} 
              onChange={(e) => handleChange('movimiento.cargado', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="languages-section">
        <div className="languages-title">IDIOMAS</div>
        <div className="languages-content">
          <textarea 
            value={editableCharacter.idiomas || ''} 
            onChange={(e) => handleChange('idiomas', e.target.value)} 
            placeholder="Idiomas conocidos..."
          />
        </div>
      </div>
        </div>
        
        <div className="middle-column">
          <div className="armor-class">
            <h3>Clase de Armadura</h3>
            <div className="armor-class-content">
              <div className="shield-icon">🛡️</div>
              <div><label>Escudo:</label><input type="checkbox" checked={editableCharacter.escudo || false} onChange={(e) => handleChange('escudo', e.target.checked)} /></div>
              <div><label>Tipo Armadura:</label><input type="text" value={editableCharacter.tipoArmadura || ''} onChange={(e) => handleChange('tipoArmadura', e.target.value)} /></div>
              <div><label>Bonif. Arm. Mágica:</label><input type="number" value={editableCharacter.bonificadorArmaduraMagica || 0} onChange={(e) => handleChange('bonificadorArmaduraMagica', e.target.value)} /></div>
              <div><label>Armadura Natural:</label><input type="number" value={editableCharacter.armaduraNatural || 0} onChange={(e) => handleChange('armaduraNatural', e.target.value)} /></div>
              <div className="final-result">CA Final: {calculateArmorClass()}</div>
            </div>
          </div>

          <div className="hit-points">
            <div className="hit-points-title">Puntos de Golpe</div>
            <div className="hit-points-content">
              <div className="heart-icon">❤️</div>
              <div><label>Dado golpe:</label><input type="text" value={editableCharacter.dadoGolpe || ''} onChange={(e) => handleChange('dadoGolpe', e.target.value)} /></div>
              <div><label>Gac0:</label><input type="text" value={editableCharacter.gac0 || ''} onChange={(e) => handleChange('gac0', e.target.value)} /></div>
            </div>
          </div>

          <div className="attack-section">
            <div className="attack-section-title">Ataques</div>
            <div className="attack-section-content">
              <div><label>Ataque Cuerpo a Cuerpo:</label><input type="checkbox" checked={editableCharacter.ataqueCuerpoACuerpo || false} onChange={(e) => handleChange('ataqueCuerpoACuerpo', e.target.checked)} /></div>
              <div><label>Ataque Proyectiles:</label><input type="checkbox" checked={editableCharacter.ataqueProyectiles || false} onChange={(e) => handleChange('ataqueProyectiles', e.target.checked)} /></div>
              <div><label>Bonif. Ataque Base:</label><input type="number" value={editableCharacter.bonificadorAtaqueBase || 0} onChange={(e) => handleChange('bonificadorAtaqueBase', e.target.value)} /></div>
              <div className="final-result">BA Final: {calculateAttackBonus()}</div>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="saving-throws-section">
            <div className="saving-throws-header">
              <h3>TIRADAS DE SALVACIÓN</h3>
              <div className="d20-indicator">D20 superior</div>
            </div>
            <div className="saving-throws-list">
              <div className="saving-throw-item">
                <input 
                  type="number" 
                  className="saving-throw-circle" 
                  value={editableCharacter.tiradasSalvacion?.venenoOMuerte || 0} 
                  onChange={(e) => handleChange('tiradasSalvacion.venenoOMuerte', e.target.value)} 
                />
                <span className="saving-throw-label">Veneno<br/>o muerte</span>
                <div className="saving-throw-line"></div>
                <div className="saving-throw-modifier-container">
                  <input 
                    type="number" 
                    className="saving-throw-modifier" 
                    value={editableCharacter.modificadoresSalvacion?.venenoOMuerte || 0} 
                    onChange={(e) => handleChange('modificadoresSalvacion.venenoOMuerte', e.target.value)} 
                  />
                  <span className="modificador-label">Modificador</span>
                </div>
              </div>
              <div className="saving-throw-item">
                <input 
                  type="number" 
                  className="saving-throw-circle" 
                  value={editableCharacter.tiradasSalvacion?.varitasMagicas || 0} 
                  onChange={(e) => handleChange('tiradasSalvacion.varitasMagicas', e.target.value)} 
                />
                <span className="saving-throw-label">Varitas<br/>mágicas</span>
                <div className="saving-throw-line"></div>
                <div className="saving-throw-modifier-container">
                  <input 
                    type="number" 
                    className="saving-throw-modifier" 
                    value={editableCharacter.modificadoresSalvacion?.varitasMagicas || 0} 
                    onChange={(e) => handleChange('modificadoresSalvacion.varitasMagicas', e.target.value)} 
                  />
                </div>
              </div>
              <div className="saving-throw-item">
                <input 
                  type="number" 
                  className="saving-throw-circle" 
                  value={editableCharacter.tiradasSalvacion?.petrificacionOParalisis || 0} 
                  onChange={(e) => handleChange('tiradasSalvacion.petrificacionOParalisis', e.target.value)} 
                />
                <span className="saving-throw-label">Petrificación<br/>o parálisis</span>
                <div className="saving-throw-line"></div>
                <div className="saving-throw-modifier-container">
                  <input 
                    type="number" 
                    className="saving-throw-modifier" 
                    value={editableCharacter.modificadoresSalvacion?.petrificacionOParalisis || 0} 
                    onChange={(e) => handleChange('modificadoresSalvacion.petrificacionOParalisis', e.target.value)} 
                  />
                </div>
              </div>
              <div className="saving-throw-item">
                <input 
                  type="number" 
                  className="saving-throw-circle" 
                  value={editableCharacter.tiradasSalvacion?.alientoDedragon || 0} 
                  onChange={(e) => handleChange('tiradasSalvacion.alientoDedragon', e.target.value)} 
                />
                <span className="saving-throw-label">Aliento<br/>de dragón</span>
                <div className="saving-throw-line"></div>
                <div className="saving-throw-modifier-container">
                  <input 
                    type="number" 
                    className="saving-throw-modifier" 
                    value={editableCharacter.modificadoresSalvacion?.alientoDedragon || 0} 
                    onChange={(e) => handleChange('modificadoresSalvacion.alientoDedragon', e.target.value)} 
                  />
                </div>
              </div>
              <div className="saving-throw-item">
                <input 
                  type="number" 
                  className="saving-throw-circle" 
                  value={editableCharacter.tiradasSalvacion?.sortilegiosVarasYBaculos || 0} 
                  onChange={(e) => handleChange('tiradasSalvacion.sortilegiosVarasYBaculos', e.target.value)} 
                />
                <span className="saving-throw-label">Sortilegios,<br/>varas y<br/>báculos</span>
                <div className="saving-throw-line"></div>
                <div className="saving-throw-modifier-container">
                  <input 
                    type="number" 
                    className="saving-throw-modifier" 
                    value={editableCharacter.modificadoresSalvacion?.sortilegiosVarasYBaculos || 0} 
                    onChange={(e) => handleChange('modificadoresSalvacion.sortilegiosVarasYBaculos', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
                <div className="skills-section">
        <div className="skills-title">HABILIDADES PORCENTUALES</div>
        <div className="skills-list">
          <div className="skill-item">
            <span>% Abrir cerraduras</span>
            <input 
              type="number" 
              value={editableCharacter.habilidadesPorcentaje?.abrirCerraduras || 0} 
              onChange={(e) => handleChange('habilidadesPorcentaje.abrirCerraduras', e.target.value)} 
            />
          </div>
          <div className="skill-item">
            <span>% Encontrar/ Desact. trampas</span>
            <input 
              type="number" 
              value={editableCharacter.habilidadesPorcentaje?.encontrarTrampas || 0} 
              onChange={(e) => handleChange('habilidadesPorcentaje.encontrarTrampas', e.target.value)} 
            />
          </div>
          <div className="skill-item">
            <span>% Hurtar</span>
            <input 
              type="number" 
              value={editableCharacter.habilidadesPorcentaje?.hurtar || 0} 
              onChange={(e) => handleChange('habilidadesPorcentaje.hurtar', e.target.value)} 
            />
          </div>
          <div className="skill-item">
            <span>% Moverse en silencio</span>
            <input 
              type="number" 
              value={editableCharacter.habilidadesPorcentaje?.moverseEnSilencio || 0} 
              onChange={(e) => handleChange('habilidadesPorcentaje.moverseEnSilencio', e.target.value)} 
            />
          </div>
          <div className="skill-item">
            <span>% Escalar muros</span>
            <input 
              type="number" 
              value={editableCharacter.habilidadesPorcentaje?.escalarMuros || 0} 
              onChange={(e) => handleChange('habilidadesPorcentaje.escalarMuros', e.target.value)} 
            />
          </div>
          <div className="skill-item">
            <span>% Esconderse en las sombras</span>
            <input 
              type="number" 
              value={editableCharacter.habilidadesPorcentaje?.esconderseEnLasSombras || 0} 
              onChange={(e) => handleChange('habilidadesPorcentaje.esconderseEnLasSombras', e.target.value)} 
            />
          </div>
          <div className="skill-item">
            <span>% Comprender lenguajes</span>
            <input 
              type="number" 
              value={editableCharacter.habilidadesPorcentaje?.comprenderLenguajes || 0} 
              onChange={(e) => handleChange('habilidadesPorcentaje.comprenderLenguajes', e.target.value)} 
            />
          </div>
          <div className="skill-item">
            <span>% Usar pergaminos</span>
            <input 
              type="number" 
              value={editableCharacter.habilidadesPorcentaje?.usarPergaminos || 0} 
              onChange={(e) => handleChange('habilidadesPorcentaje.usarPergaminos', e.target.value)} 
            />
          </div>
        </div>
      </div>
        </div>
      </div>

    <div className="weapons-section">
        <div className="weapons-header">
          <h3>ARMAS</h3>
          <button onClick={addWeapon} className="add-weapon-btn">+</button>
        </div>
        
        {editableCharacter.armas && editableCharacter.armas.length > 0 && (
          <div className="weapons-table">
            <div className="weapons-table-header">
              <div className="weapon-header-row">
                <span>Arma</span>
                <span>Total</span>
                <span>Fue/Des</span>
                <span>Magia</span>
                <span>Ataque</span>
                <span></span>
              </div>
            </div>
            
            {editableCharacter.armas.map((weapon) => (
              <div key={weapon.id} className="weapon-group">
                <div className="weapon-row">
                  <input 
                    type="text" 
                    value={weapon.nombre || ''} 
                    onChange={(e) => handleChange(`armas.${editableCharacter.armas.indexOf(weapon)}.nombre`, e.target.value)}
                    placeholder="Nombre del arma"
                    className="weapon-name"
                  />
                  
                  <input 
                    type="number" 
                    value={calculateAttackTotal(weapon)}
                    readOnly
                    className="weapon-total readonly"
                  />
                  
                  <input 
                    type="number" 
                    value={weapon.fuerzaDestreza || 0} 
                    onChange={(e) => handleChange(`armas.${editableCharacter.armas.indexOf(weapon)}.fuerzaDestreza`, e.target.value)}
                    className="weapon-stat"
                  />
                  
                  <input 
                    type="number" 
                    value={weapon.magiaAtaque || 0} 
                    onChange={(e) => handleChange(`armas.${editableCharacter.armas.indexOf(weapon)}.magiaAtaque`, e.target.value)}
                    className="weapon-stat"
                  />
                  
                  <input 
                    type="number" 
                    value={weapon.ataqueBase || 0} 
                    onChange={(e) => handleChange(`armas.${editableCharacter.armas.indexOf(weapon)}.ataqueBase`, e.target.value)}
                    className="weapon-stat"
                  />
                  
                  <button 
                    onClick={() => removeWeapon(weapon.id)} 
                    className="remove-weapon-btn"
                    title="Eliminar arma"
                  >
                    ×
                  </button>
                </div>
                
                <div className="damage-header-row">
                  <span>Daño</span>
                  <span>Total</span>
                  <span>M.Fuerza</span>
                  <span>Magia</span>
                  <span>Especial</span>
                  <span></span>
                </div>
                
                <div className="damage-row">
                  <input 
                    type="text" 
                    value={weapon.totalDano || ''} 
                    onChange={(e) => handleChange(`armas.${editableCharacter.armas.indexOf(weapon)}.totalDano`, e.target.value)}
                    placeholder="1d6+2"
                    className="weapon-damage"
                  />
                  
                  <input 
                    type="number" 
                    value={calculateDamageTotal(weapon)}
                    readOnly
                    className="weapon-total readonly"
                  />
                  
                  <input 
                    type="number" 
                    value={weapon.magicaFuerza || 0} 
                    onChange={(e) => handleChange(`armas.${editableCharacter.armas.indexOf(weapon)}.magicaFuerza`, e.target.value)}
                    className="weapon-stat"
                  />
                  
                  <input 
                    type="number" 
                    value={weapon.magiaDano || 0} 
                    onChange={(e) => handleChange(`armas.${editableCharacter.armas.indexOf(weapon)}.magiaDano`, e.target.value)}
                    className="weapon-stat"
                  />
                  
                  <input 
                    type="text" 
                    value={weapon.especial || ''} 
                    onChange={(e) => handleChange(`armas.${editableCharacter.armas.indexOf(weapon)}.especial`, e.target.value)}
                    placeholder="Especial"
                    className="weapon-special"
                  />
                  
                  <div className="empty-cell"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(!editableCharacter.armas || editableCharacter.armas.length === 0) && (
          <div className="no-weapons">
            <p>No hay armas agregadas. Haz clic en + para agregar una.</p>
          </div>
        )}
      </div>





      <div className="class-abilities">
        <label>Habilidades de clase</label>
        <textarea value={editableCharacter.habilidadesDeClase || ''} onChange={(e) => handleChange('habilidadesDeClase', e.target.value)} />
      </div>

      <div className="objects-equipment">
        <div className="objects">
          <label>Objetos</label>
          <textarea value={editableCharacter.objetos || ''} onChange={(e) => handleChange('objetos', e.target.value)} />
        </div>
        <div className="equipment">
          <label>Equipo</label>
          <textarea value={editableCharacter.equipo || ''} onChange={(e) => handleChange('equipo', e.target.value)} />
        </div>
      </div>

      <div className="treasure-equipment">
        <div className="treasure">
          <label>Tesoro</label>
          <div className="treasure-fields">
            <div className="treasure-field">
              <label>Gemas:</label>
              <input 
                type="number" 
                value={editableCharacter.tesoro?.gemas || 0} 
                onChange={(e) => handleChange('tesoro.gemas', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="treasure-field">
              <label>Platino:</label>
              <input 
                type="number" 
                value={editableCharacter.tesoro?.platino || 0} 
                onChange={(e) => handleChange('tesoro.platino', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="treasure-field">
              <label>Oro:</label>
              <input 
                type="number" 
                value={editableCharacter.tesoro?.oro || 0} 
                onChange={(e) => handleChange('tesoro.oro', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="treasure-field">
              <label>Electro:</label>
              <input 
                type="number" 
                value={editableCharacter.tesoro?.electro || 0} 
                onChange={(e) => handleChange('tesoro.electro', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="treasure-field">
              <label>Plata:</label>
              <input 
                type="number" 
                value={editableCharacter.tesoro?.plata || 0} 
                onChange={(e) => handleChange('tesoro.plata', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="treasure-field">
              <label>Cobre:</label>
              <input 
                type="number" 
                value={editableCharacter.tesoro?.cobre || 0} 
                onChange={(e) => handleChange('tesoro.cobre', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="spells-section">
        <div className="spells-header">
          <h3>LIBRO DE CONJUROS</h3>
          <button onClick={addSpell} className="add-spell-btn">+</button>
        </div>
        
        <div className="spells-per-level">
          <h4>CONJUROS POR NIVEL</h4>
          <div className="level-grid">
            {[1,2,3,4,5,6,7,8,9].map(level => (
              <div key={level} className="level-item">
                <span>{level}</span>
                <input 
                  type="number" 
                  value={editableCharacter.conjurosPorNivel?.[level] || 0} 
                  onChange={(e) => handleChange(`conjurosPorNivel.${level}`, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {editableCharacter.conjuros && editableCharacter.conjuros.length > 0 && (
          <div className="spells-table">
            <div className="spells-table-header">
              <div className="spell-header-row">
                <span></span>
                <span>CONJURO</span>
                <span>NIVEL</span>
                <span>ALCANCE</span>
                <span>DURACIÓN</span>
                <span>EFECTO</span>
                <span></span>
              </div>
            </div>
            
            {editableCharacter.conjuros.map((spell) => (
              <div key={spell.id} className="spell-row">
                <input 
                  type="checkbox" 
                  checked={spell.preparado || false}
                  onChange={(e) => handleChange(`conjuros.${editableCharacter.conjuros.indexOf(spell)}.preparado`, e.target.checked)}
                  className="spell-checkbox"
                />
                
                <input 
                  type="text" 
                  value={spell.nombre || ''} 
                  onChange={(e) => handleChange(`conjuros.${editableCharacter.conjuros.indexOf(spell)}.nombre`, e.target.value)}
                  placeholder="Nombre del conjuro"
                  className="spell-name"
                />
                
                <input 
                  type="number" 
                  value={spell.nivel || 1} 
                  onChange={(e) => handleChange(`conjuros.${editableCharacter.conjuros.indexOf(spell)}.nivel`, parseInt(e.target.value) || 1)}
                  className="spell-level"
                  min="1"
                  max="9"
                />
                
                <input 
                  type="text" 
                  value={spell.alcance || ''} 
                  onChange={(e) => handleChange(`conjuros.${editableCharacter.conjuros.indexOf(spell)}.alcance`, e.target.value)}
                  placeholder="Alcance"
                  className="spell-range"
                />
                
                <input 
                  type="text" 
                  value={spell.duracion || ''} 
                  onChange={(e) => handleChange(`conjuros.${editableCharacter.conjuros.indexOf(spell)}.duracion`, e.target.value)}
                  placeholder="Duración"
                  className="spell-duration"
                />
                
                <input 
                  type="text" 
                  value={spell.efecto || ''} 
                  onChange={(e) => handleChange(`conjuros.${editableCharacter.conjuros.indexOf(spell)}.efecto`, e.target.value)}
                  placeholder="Efecto"
                  className="spell-effect"
                />
                
                <button 
                  onClick={() => removeSpell(spell.id)} 
                  className="remove-spell-btn"
                  title="Eliminar conjuro"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {(!editableCharacter.conjuros || editableCharacter.conjuros.length === 0) && (
          <div className="no-spells">
            <p>No hay conjuros agregados. Haz clic en + para agregar uno.</p>
          </div>
        )}
      </div>

      <button onClick={handleDownloadImage} className="download-button">Descargar Imagen</button>
    </div>
  );
};

export default CharacterSheet;
