import { useState, useEffect, useRef } from 'react';

/**
 * COMPONENTE REUTILIZÁVEL: CustomSelect
 * -------------------------------------
 * Substitui o <select> nativo do HTML para garantir identidade visual idêntica
 * entre diferentes navegadores e suporte completo ao Modo Claro e Modo Escuro.
 *
 * Acessibilidade (WCAG 2.2 AA):
 * - Usa role="combobox" e aria-expanded para informar leitores de tela.
 * - Permite navegação completa via teclado (Enter, Espaço, Escape, Setas).
 */
export default function CustomSelect({ options, value, onChange, placeholder, labelId }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Fecha o menu automaticamente quando a usuária clica fora do componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedIndex = options.findIndex(o => o.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  // Controle de teclado acessível (Enter/Espaço abre/fecha, Setas alternam opções, Esc fecha)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.stopPropagation();
        setIsOpen(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const nextIdx = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
        onChange(options[nextIdx].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const prevIdx = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
        onChange(options[prevIdx].value);
      }
    }
  };

  return (
    <div 
      className={`custom-select-container ${isOpen ? 'open' : ''}`} 
      ref={selectRef} 
      tabIndex={0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-labelledby={labelId}
      onKeyDown={handleKeyDown}
    >
      <div className="cs-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className={!selectedOption ? 'placeholder' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className="cs-arrow" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      {isOpen && (
        <ul className="cs-menu" role="listbox" aria-labelledby={labelId}>
          <li className="cs-option disabled" role="presentation" aria-disabled="true">{placeholder}</li>
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`cs-option ${opt.value === value ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
              {opt.value === value && (
                <svg className="cs-check" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
