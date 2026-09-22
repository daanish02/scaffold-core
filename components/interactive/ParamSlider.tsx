export interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

/** A labeled range slider with a live numeric readout, styled per the .slider-group tokens. */
export default function ParamSlider({
  label,
  value,
  min,
  max,
  step = 0.05,
  onChange,
}: ParamSliderProps) {
  return (
    <div className="slider-group">
      <label>
        {label} <output>{value.toFixed(2)}</output>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.currentTarget.value))}
      />
    </div>
  );
}
