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
        </div>
        
        <div className="middle-column">
          <div className="armor-class">
            <h3>Clase de Armadura</h3>
            <div className="shield-icon">🛡️</div>
            <div><label>Escudo <input type="checkbox" checked={editableCharacter.escudo || false} onChange={(e) => handleChange('escudo', e.target.checked)} /></label></div>
            <div><label>Tipo Armadura <input type="text" value={editableCharacter.tipoArmadura || ''} onChange={(e) => handleChange('tipoArmadura', e.target.value)} /></label></div>
            <div><label>Bonificador Armadura Mágica <input type="number" value={editableCharacter.bonificadorArmaduraMagica || 0} onChange={(e) => handleChange('bonificadorArmaduraMagica', e.target.value)} /></label></div>
            <div><label>Armadura Natural <input type="number" value={editableCharacter.armaduraNatural || 0} onChange={(e) => handleChange('armaduraNatural', e.target.value)} /></label></div>
            <div><strong>CA Final: {calculateArmorClass()}</strong></div>
          </div>

          <div className="hit-points">
            <div><strong>Puntos de Golpe</strong></div>
            <div className="heart-icon">❤️</div>
            <div><label>Dado golpe <input type="text" value={editableCharacter.dadoGolpe || ''} onChange={(e) => handleChange('dadoGolpe', e.target.value)} /></label></div>
            <div><label>Gac0 <input type="text" value={editableCharacter.gac0 || ''} onChange={(e) => handleChange('gac0', e.target.value)} /></label></div>
          </div>

          <div className="initiative">
            <div><strong>Iniciativa</strong></div>
            <div>
              = <input type="number" value={editableCharacter.iniciativaBase || 0} onChange={(e) => handleChange('iniciativaBase', e.target.value)} /> + <input type="number" value={editableCharacter.iniciativaBonus || 0} onChange={(e) => handleChange('iniciativaBonus', e.target.value)} />
            </div>
          </div>

          <div className="attack-section">
            <div>
              <label>Ataque Cuerpo a Cuerpo <input type="checkbox" checked={editableCharacter.ataqueCuerpoACuerpo || false} onChange={(e) => handleChange('ataqueCuerpoACuerpo', e.target.checked)} /></label>
            </div>
            <div>
              <label>Ataque Proyectiles <input type="checkbox" checked={editableCharacter.ataqueProyectiles || false} onChange={(e) => handleChange('ataqueProyectiles', e.target.checked)} /></label>
            </div>
            <div>
              <label>Bonificador de Ataque Base <input type="number" value={editableCharacter.bonificadorAtaqueBase || 0} onChange={(e) => handleChange('bonificadorAtaqueBase', e.target.value)} /></label>
            </div>
            <div><strong>BA Final: {calculateAttackBonus()}</strong></div>
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
        </div>
      </div>

      <div className="main-weapons">
        <label>Armas Principales</label>
        <textarea value={editableCharacter.armasPrincipales || ''} onChange={(e) => handleChange('armasPrincipales', e.target.value)} />
      </div>

      <div className="movement-languages">
        <div className="movement">
          <label>Movimiento</label>
          <div>
            <label>Base <input type="number" value={editableCharacter.movimiento?.base || 0} onChange={(e) => handleChange('movimiento.base', e.target.value)} /></label>
            <label>Combate <input type="number" value={editableCharacter.movimiento?.combate || 0} onChange={(e) => handleChange('movimiento.combate', e.target.value)} /></label>
            <label>Carrera <input type="number" value={editableCharacter.movimiento?.carrera || 0} onChange={(e) => handleChange('movimiento.carrera', e.target.value)} /></label>
            <label>Cargado <input type="number" value={editableCharacter.movimiento?.cargado || 0} onChange={(e) => handleChange('movimiento.cargado', e.target.value)} /></label>
          </div>
        </div>

        <div className="languages">
          <label>Idiomas</label>
          <textarea value={editableCharacter.idiomas || ''} onChange={(e) => handleChange('idiomas', e.target.value)} />
        </div>
      </div>

      <div className="skills-section">
        <div className="base-dice">1d6 Base</div>
        <div className="skills-list">
          {editableCharacter.habilidadesPorcentaje && Object.entries(editableCharacter.habilidadesPorcentaje).map(([skill, percent]) => (
            <div key={skill} className="skill-item">
              <label>
                <input type="checkbox" checked={editableCharacter.habilidadesPorcentaje[skill] > 0} onChange={(e) => handleChange(`habilidadesPorcentaje.${skill}`, e.target.checked ? 1 : 0)} />
                {skill}
              </label>
              <input type="number" value={percent} onChange={(e) => handleChange(`habilidadesPorcentaje.${skill}`, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="skills-percentage">
          <label>% Abrir cerraduras <input type="number" value={editableCharacter.abrirCerraduras || 0} onChange={(e) => handleChange('abrirCerraduras', e.target.value)} /></label>
          <label>% Encontrar / Desactivar trampas <input type="number" value={editableCharacter.encontrarTrampas || 0} onChange={(e) => handleChange('encontrarTrampas', e.target.value)} /></label>
          <label>% Hurtar <input type="number" value={editableCharacter.hurtar || 0} onChange={(e) => handleChange('hurtar', e.target.value)} /></label>
          <label>% Moverse en Silencio <input type="number" value={editableCharacter.moverseEnSilencio || 0} onChange={(e) => handleChange('moverseEnSilencio', e.target.value)} /></label>
          <label>% Esconderse en las Sombras <input type="number" value={editableCharacter.esconderseEnLasSombras || 0} onChange={(e) => handleChange('esconderseEnLasSombras', e.target.value)} /></label>
          <label>% Comprender Lenguajes <input type="number" value={editableCharacter.comprenderLenguajes || 0} onChange={(e) => handleChange('comprenderLenguajes', e.target.value)} /></label>
          <label>% Usar Pergaminos <input type="number" value={editableCharacter.usarPergaminos || 0} onChange={(e) => handleChange('usarPergaminos', e.target.value)} /></label>
        </div>
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
      <button onClick={handleDownloadImage} className="download-button">Descargar Imagen</button>
    </div>
  );
};

export default CharacterSheet;
