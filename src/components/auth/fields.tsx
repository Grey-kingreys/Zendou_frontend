"use client";

import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

const controlClass =
  "w-full rounded-lg border border-white/[0.09] bg-[#0E1013] px-3.5 py-2.5 text-[16px] text-[#EDEEF0] placeholder:text-[#5E646B] outline-none transition-colors focus:border-[#5B7CFA] focus:ring-1 focus:ring-[#5B7CFA]";

const labelClass = "mb-1.5 block text-[13px] font-medium text-[#C5CACF]";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  /** Affiche un bouton œil pour révéler la saisie (uniquement pour type="password"). */
  revealable?: boolean;
};

export function TextField({
  label,
  hint,
  id,
  name,
  type,
  revealable = false,
  ...props
}: TextFieldProps) {
  const inputId = id ?? name;
  const [visible, setVisible] = useState(false);
  const showToggle = revealable && type === "password";
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <div className={showToggle ? "relative" : undefined}>
        <input
          id={inputId}
          name={name}
          type={inputType}
          className={showToggle ? `${controlClass} pr-11` : controlClass}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-[#70767D] transition-colors hover:text-[#C5CACF]"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[12.5px] text-[#70767D]">{hint}</p>}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.4 13.4 0 0 1-3.1 3.9M6.7 6.7C3.8 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 5.3-1.4" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
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
  disabled = false,
  children,
}: {
  loading: boolean;
  loadingLabel: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full rounded-[9px] bg-[#5B7CFA] py-[13px] text-[15px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-60"
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
