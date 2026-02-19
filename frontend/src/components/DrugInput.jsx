import { useState, useRef, useEffect } from 'react';
import { Pill, X, ChevronDown } from 'lucide-react';
import { SUPPORTED_DRUGS, DRUG_GENE_MAP } from '../constants';

export default function DrugInput({ selectedDrugs, setSelectedDrugs }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filtered = SUPPORTED_DRUGS.filter(
    (d) =>
      d.toLowerCase().includes(query.toLowerCase()) &&
      !selectedDrugs.includes(d)
  );

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addDrug = (drug) => {
    setSelectedDrugs([...selectedDrugs, drug]);
    setQuery('');
    setOpen(false);
  };

  const removeDrug = (drug) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d !== drug));
  };

  const selectAll = () => setSelectedDrugs([...SUPPORTED_DRUGS]);

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold text-gray-700 dark:text-gray-300">
          Select Drugs to Analyze
        </label>
        <button
          type="button"
          onClick={selectAll}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
        >
          Select All
        </button>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2 min-h-[36px]" role="list" aria-label="Selected drugs">
        {selectedDrugs.map((drug) => (
          <span
            key={drug}
            role="listitem"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
                       bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/20"
          >
            <Pill className="w-3.5 h-3.5" />
            {drug}
            <button
              onClick={() => removeDrug(drug)}
              aria-label={`Remove ${drug}`}
              className="ml-0.5 p-1 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>

      {/* Autocomplete input */}
      <div className="relative">
        <div className="flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={
              selectedDrugs.length === SUPPORTED_DRUGS.length
                ? 'All drugs selected'
                : 'Type to search drugs…'
            }
            aria-label="Search drugs"
            aria-expanded={open && filtered.length > 0}
            role="combobox"
            autoComplete="off"
            className="w-full rounded-xl glass-input px-4 py-3 text-base
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       text-gray-900 dark:text-gray-100"
          />
          <ChevronDown
            className="absolute right-3 w-5 h-5 text-gray-400 pointer-events-none"
          />
        </div>

        {open && filtered.length > 0 && (
          <ul className="absolute z-30 mt-1 w-full max-h-56 overflow-auto rounded-xl bg-gray-200 dark:bg-gray-800 backdrop-blur-xl border border-gray-300 dark:border-gray-600 shadow-2xl" role="listbox">
            {filtered.map((drug) => (
              <li
                key={drug}
                onClick={() => addDrug(drug)}
                role="option"
                aria-selected={false}
                className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer
                           hover:bg-gray-300/80 dark:hover:bg-gray-700/80
                           text-gray-800 dark:text-gray-200 transition-colors"
              >
                <span className="font-semibold">{drug}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {DRUG_GENE_MAP[drug]?.join(', ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
