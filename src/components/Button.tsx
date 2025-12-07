"use client";

type ButtonProps = {
  value: string;
  type: "submit" | "button";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export default function Button(props: ButtonProps) {
  const { value, type, onClick, disabled = false } = props;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded bg-blue-600 px-7 py-1.5 text-white hover:bg-blue-700"
    >
      {value}
    </button>
  );
}
