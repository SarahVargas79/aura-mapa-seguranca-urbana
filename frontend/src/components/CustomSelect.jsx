import { useState, useEffect, useRef } from 'react';

/**
 * COMPONENTE REUTILIZÁVEL: CustomSelect
 * -------------------------------------
 * Substitui o <select> nativo do HTML para manter a identidade visual
 * entre navegadores e suporte completo ao Modo Claro e Modo Escuro.
 *
 * Acessibilidade (WCAG 2.2 AA):
 * - Usa role="combobox", aria-expanded, aria-controls e aria-activedescendant.
 * - Permite navegação completa via teclado (Enter, Espaço, Escape, Setas).
 */
export default function CustomSelect({
  selectKey = 'select',
  options,
  value,
  onChange,
  placeholder,
  labelId,
  required = true,
  invalid = false,
  containerRef,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const internalRef = useRef(null);
  const menuRef = useRef(null);
  const selectRef = containerRef || internalRef;

  // Fecha o menu automaticamente quando a usuária clica fora do componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectRef]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const timer = setTimeout(() => {
        menuRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const listboxId = `${selectKey}-listbox`;
  const activeOptionId =
    isOpen && selectedOption ? `${selectKey}-option-${selectedOption.value}` : undefined;

  // Controle de teclado acessível (Enter/Espaço abre/fecha, Setas alternam opções, Esc fecha)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
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
      data-select={selectKey}
      ref={selectRef}
      tabIndex={0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-labelledby={labelId}
      aria-required={required}
      aria-controls={isOpen ? listboxId : undefined}
      aria-activedescendant={activeOptionId}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`cs-trigger ${invalid ? 'invalid' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!selectedOption ? 'placeholder' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className="cs-arrow"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {isOpen && (
        <ul
          id={listboxId}
          ref={menuRef}
          className="cs-menu"
          role="listbox"
          aria-labelledby={labelId}
        >
          <li className="cs-option disabled" role="presentation" aria-disabled="true">
            {placeholder}
          </li>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={`${selectKey}-option-${opt.value}`}
                role="option"
                data-value={opt.value}
                aria-selected={isSelected}
                className={`cs-option ${isSelected ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg
                    className="cs-check"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
