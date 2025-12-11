import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder = "Sélectionner...",
    label,
    required = false,
    disabled = false,
    renderOption = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const optionsRef = useRef([]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset highlighted index when options change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchTerm]);

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
            optionsRef.current[highlightedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [highlightedIndex]);

    // Filter options
    const filteredOptions = options.filter(option => {
        const label = option.label || option.nom || option.name || '';
        return label.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Find selected option object
    const selectedOption = options.find(opt => opt.value === value);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}

            <div
                className={`
                    w-full px-4 py-2 bg-slate-900/50 border rounded-lg flex items-center justify-between cursor-pointer transition-all
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-800' : 'hover:border-cyan-500/50'}
                    ${isOpen ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-slate-700'}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <div className="flex-1 truncate text-white">
                    {selectedOption ? (
                        renderOption ? renderOption(selectedOption) : (selectedOption.label || selectedOption.nom)
                    ) : (
                        <span className="text-slate-500">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto" role="listbox">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option.value}
                                    ref={el => optionsRef.current[index] = el}
                                    className={`
                                        px-4 py-2.5 text-sm cursor-pointer transition-colors
                                        ${option.value === value ? 'bg-cyan-500/20 text-cyan-400 font-medium' : ''}
                                        ${index === highlightedIndex ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                                    `}
                                    onClick={() => handleSelect(option)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    role="option"
                                    aria-selected={option.value === value}
                                >
                                    {renderOption ? renderOption(option) : (option.label || option.nom)}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                Aucun résultat trouvé
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
