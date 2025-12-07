"use client";
import cn from "@/lib/cn";

// Props型定義
type InputItemProps = {
  name: string;
  type: "text" | "number" | "date" | "textarea" | "select";
  label: string;
  placeholder?: string;
  width: "auto" | "xs" | "sm" | "md" | "lg" | "full";
  selectItems?: {
    value: string;
    label: string;
  }[];
  validationErrorMessages?: string[] | undefined;
  onBlur?: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  defaultValue?: string | number | readonly string[] | undefined;
};

export default function InputItem(props: InputItemProps) {
  // props展開
  const {
    name,
    type,
    label,
    placeholder,
    width,
    selectItems,
    validationErrorMessages,
    onBlur,
    defaultValue,
  } = props;

  // インプット横幅
  const widthSize = {
    auto: "w-auto",
    xs: "w-xs",
    sm: "w-sm",
    md: "w-md",
    lg: "w-lg",
    full: "w-full",
  };

  // インプット基本クラス
  const className =
    "bg-white border border-gray-300 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  // バリデーションエラー時追加クラス
  const errorClassName = "border-red-300 bg-red-50 focus:ring-red-500";

  return (
    <div>
      {/* ラベル */}
      <label htmlFor={name} className="mb-1 block w-fit text-sm">
        {label}
      </label>

      {/* INPUT */}
      {(type === "text" || type === "number" || type === "date") && (
        <input
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          onBlur={onBlur}
          className={cn(
            className,
            widthSize[width],
            validationErrorMessages &&
              validationErrorMessages.length > 0 &&
              errorClassName,
          )}
          defaultValue={defaultValue}
        />
      )}
      {/* TEXTAREA */}
      {type === "textarea" && (
        <textarea
          name={name}
          id={name}
          placeholder={placeholder}
          onBlur={onBlur}
          className={cn(
            className,
            widthSize[width],
            "field-sizing-content",
            "min-h-15",
            "resize-none",
            validationErrorMessages &&
              validationErrorMessages.length > 0 &&
              errorClassName,
          )}
          defaultValue={defaultValue}
        ></textarea>
      )}
      {/* SELECT */}
      {type === "select" && (
        <select
          name={name}
          id={name}
          onBlur={onBlur}
          className={cn(
            className,
            widthSize[width],
            validationErrorMessages &&
              validationErrorMessages.length > 0 &&
              errorClassName,
          )}
          defaultValue={defaultValue}
        >
          {selectItems?.map((selectItem) => (
            <option key={selectItem.value} value={selectItem.value}>
              {selectItem.label}
            </option>
          ))}
        </select>
      )}

      {/* バリデーションエラーメッセージ */}
      {validationErrorMessages && validationErrorMessages.length > 0 && (
        <p className="text-red-500 text-sm">
          {validationErrorMessages.join(",")}
        </p>
      )}
    </div>
  );
}
