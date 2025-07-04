import React, { useState } from 'react';
import './CharacterSheet.css';

const CharacterSheet = ({ character, onUpdateCharacter }) => {
  const [editableCharacter, setEditableCharacter] = useState(character);

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

  if (!character) return null;

  return (
    <div className="character-sheet">
      <h2>Ficha de Personaje</h2>
      <div className="top-info">
        <div className="left-info">
          <div><strong>Nombre:</strong> <input type="text" value={editableCharacter.nombre} onChange={(e) => handleChange('nombre', e.target.value)} /></div>
          <div><strong>Nivel:</strong> <input type="number" value={editableCharacter.nivel || ''} onChange={(e) => handleChange('nivel', e.target.value)} /></div>
          <div><strong>Experiencia:</strong> <input type="number" value={editableCharacter.experiencia || ''} onChange={(e) => handleChange('experiencia', e.target.value)} /></div>
        </div>
        <div className="right-info">
          <div><strong>Clase:</strong> <input type="text" value={editableCharacter.clase} onChange={(e) => handleChange('clase', e.target.value)} /></div>
          <div><strong>Alineamiento:</strong> <input type="text" value={editableCharacter.alineamiento || ''} onChange={(e) => handleChange('alineamiento', e.target.value)} /></div>
          <div><strong>Siguiente nivel:</strong> <input type="number" value={editableCharacter.siguienteNivel || ''} onChange={(e) => handleChange('siguienteNivel', e.target.value)} /></div>
        </div>
      </div>

      <hr />

      <div className="characteristics-section">
        <div className="characteristics-list">
          {Object.entries(editableCharacter.caracteristicas).map(([stat, value]) => (
            <div key={stat} className="characteristic-item">
              <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
              <div className="modifiers-boxes">
                <input type="checkbox" />
                <input type="checkbox" />
              </div>
              <input type="number" className="stat-value" value={value} onChange={(e) => handleChange(`caracteristicas.${stat}`, e.target.value)} />
              <div className="bonus">Bonificador: {editableCharacter.bonificadores[stat]}</div>
            </div>
          ))}
        </div>

        <div className="armor-hit-initiative">
          <div className="armor-class">
            <div><strong>Clase de Armadura</strong></div>
            <div className="shield-icon">🛡️</div>
            <div><label>Escudo <input type="checkbox" checked={editableCharacter.escudo || false} onChange={(e) => handleChange('escudo', e.target.checked)} /></label></div>
            <div><label>Tipo Armadura <input type="text" value={editableCharacter.tipoArmadura || ''} onChange={(e) => handleChange('tipoArmadura', e.target.value)} /></label></div>
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
        </div>

        <div className="attack-section">
          <div>
            <label>Ataque Cuerpo a Cuerpo <input type="checkbox" checked={editableCharacter.ataqueCuerpoACuerpo || false} onChange={(e) => handleChange('ataqueCuerpoACuerpo', e.target.checked)} /></label>
          </div>
          <div>
            <label>Ataque Proyectiles <input type="checkbox" checked={editableCharacter.ataqueProyectiles || false} onChange={(e) => handleChange('ataqueProyectiles', e.target.checked)} /></label>
          </div>
        </div>

        <div className="special-abilities">
          <div><label>Veneno o Muerte <input type="checkbox" checked={editableCharacter.venenoOMuerte || false} onChange={(e) => handleChange('venenoOMuerte', e.target.checked)} /></label></div>
          <div><label>Varitas mágicas y cetros <input type="checkbox" checked={editableCharacter.varitasMagicas || false} onChange={(e) => handleChange('varitasMagicas', e.target.checked)} /></label></div>
          <div><label>Petrificación o Parálisis <input type="checkbox" checked={editableCharacter.petrificacionOParalisis || false} onChange={(e) => handleChange('petrificacionOParalisis', e.target.checked)} /></label></div>
          <div><label>Armas de Aliento <input type="checkbox" checked={editableCharacter.armasDeAliento || false} onChange={(e) => handleChange('armasDeAliento', e.target.checked)} /></label></div>
          <div><label>Conjuros y Armas mágicas <input type="checkbox" checked={editableCharacter.conjurosYArmasMagicas || false} onChange={(e) => handleChange('conjurosYArmasMagicas', e.target.checked)} /></label></div>
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
    </div>
  );
};

export default CharacterSheet;