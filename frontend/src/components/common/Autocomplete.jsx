import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

/**
 * Reusable Autocomplete component with search functionality
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of items to search through
 * @param {Function} props.onSelect - Callback when item is selected
 * @param {Function} props.renderItem - Custom render function for each item
 * @param {Function} props.getItemLabel - Function to get display label from item
 * @param {Function} props.filterItems - Custom filter function (optional)
 * @param {string} props.placeholder - Input placeholder
 * @param {any} props.value - Currently selected value
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disable the input
 */
const Autocomplete = ({
    items = [],
    onSelect,
    renderItem,
    getItemLabel,
    filterItems,
    placeholder = 'Rechercher...',
    value,
    className = '',
    disabled = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Filter items based on search term
    const filteredItems = filterItems
        ? filterItems(items, searchTerm)
        : items.filter(item => {
            const label = getItemLabel(item).toLowerCase();
            return label.includes(searchTerm.toLowerCase());
        });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update search term when value changes externally
    useEffect(() => {
        if (value && items.length > 0) {
            const selectedItem = items.find(item => item.id === value);
            if (selectedItem) {
                setSearchTerm(getItemLabel(selectedItem));
            }
        } else {
            setSearchTerm('');
        }
    }, [value, items, getItemLabel]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setIsOpen(true);
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredItems.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
                    handleSelect(filteredItems[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSelect = (item) => {
        setSearchTerm(getItemLabel(item));
        setIsOpen(false);
        setHighlightedIndex(-1);
        onSelect(item);
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsOpen(false);
        onSelect(null);
        inputRef.current?.focus();
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {/* Input Field */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full pl-10 pr-20 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchTerm && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title="Effacer"
                        >
                            <X size={16} className="text-slate-400" />
                        </button>
                    )}
                    <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Dropdown List */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredItems.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">
                            Aucun résultat trouvé
                        </div>
                    ) : (
                        filteredItems.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className={`px-4 py-3 cursor-pointer transition-colors ${index === highlightedIndex
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'hover:bg-slate-700/50 text-white'
                                    }`}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                {renderItem ? renderItem(item) : getItemLabel(item)}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Autocomplete;
