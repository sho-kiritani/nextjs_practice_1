"use client";

type ButtonProps = {
  value: string;
  type: "submit" | "button";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({
  value,
  type,
  onClick,
  disabled = false,
  loading = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded bg-blue-600 px-7 py-1.5 text-white hover:bg-blue-700"
    >
      {loading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        value
      )}
    </button>
  );
}
