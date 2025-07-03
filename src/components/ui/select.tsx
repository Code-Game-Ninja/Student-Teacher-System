import * as React from "react";

export function Select({ children, onValueChange, required, ...props }: any) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  return React.Children.map(children, child =>
    React.cloneElement(child, { onValueChange, required, open, setOpen, value, setValue })
  );
}

export function SelectTrigger({ children, onClick, open, setOpen, ...props }: any) {
  return (
    <button type="button" onClick={() => setOpen(!open)} {...props}>
      {children}
    </button>
  );
}

export function SelectValue({ placeholder, value, ...props }: any) {
  return <span {...props}>{value || placeholder}</span>;
}

export function SelectContent({ children, open, setOpen, setValue, ...props }: any) {
  if (!open) return null;
  return (
    <div {...props} style={{ position: "absolute", zIndex: 10, background: "white", border: "1px solid #ccc", borderRadius: 8 }}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { setOpen, setValue })
      )}
    </div>
  );
}

export function SelectItem({ children, value, setOpen, setValue, ...props }: any) {
  return (
    <div
      onClick={() => {
        setValue(value);
        setOpen(false);
      }}
      style={{ padding: 8, cursor: "pointer" }}
      {...props}
    >
      {children}
    </div>
  );
} 