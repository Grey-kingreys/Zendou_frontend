import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const controlClass =
  "w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[15px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none transition-colors focus:border-[#5B7CFA] focus:ring-1 focus:ring-[#5B7CFA]";

const labelClass = "mb-1.5 block text-[13px] font-medium text-[#C5CACF]";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, id, name, ...props }: TextFieldProps) {
  const inputId = id ?? name;
  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <input id={inputId} name={name} className={controlClass} {...props} />
      {hint && <p className="mt-1.5 text-[12.5px] text-[#70767D]">{hint}</p>}
    </div>
  );
}

type SelectOption = { value: string; label: string };

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
};

export function SelectField({
  label,
  id,
  name,
  options,
  placeholder,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? name;
  return (
    <div>
      <label htmlFor={selectId} className={labelClass}>
        {label}
      </label>
      <select id={selectId} name={name} className={controlClass} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
      {message}
    </p>
  );
}

export function SubmitButton({
  loading,
  loadingLabel,
  children,
}: {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-[9px] bg-[#5B7CFA] py-[13px] text-[15px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-60"
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
