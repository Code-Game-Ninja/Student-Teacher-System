import * as React from "react";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ checked, onCheckedChange, ...props }, ref) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={e => onCheckedChange(e.target.checked)}
      className="sr-only"
      {...props}
    />
    <span className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-200 ${checked ? 'bg-blue-600' : ''}`}>
      <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${checked ? 'translate-x-4' : ''}`}></span>
    </span>
  </label>
));
Switch.displayName = "Switch"; 