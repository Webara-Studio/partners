/**
 * Reusable form field wrapper with label, optional hint, and required indicator.
 */
export function FormField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-cream">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/**
 * Consistent text input with Webara brand styling.
 */
export function TextInput({
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
      placeholder={placeholder}
    />
  );
}

/**
 * Consistent textarea with Webara brand styling.
 */
export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <textarea
      required={required}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input resize-none"
      placeholder={placeholder}
    />
  );
}

/**
 * Consistent select dropdown.
 */
export function SelectInput<T extends string>({
  value,
  onChange,
  children,
}: {
  value: T;
  onChange: (v: T) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="input"
    >
      {children}
    </select>
  );
}

/**
 * Checkbox with label text.
 */
export function FormCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-gold"
      />
      <span className="text-xs text-muted">{children}</span>
    </label>
  );
}

/**
 * Primary gold submit button.
 */
export function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-gold py-4 font-semibold text-dark transition hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Submitting..." : children}
    </button>
  );
}
