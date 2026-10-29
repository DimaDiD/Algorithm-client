import { Segmented } from "antd";
import { useTable } from "../../Store";

export const LANGUAGE_OPTIONS = [
  { label: "C#", value: "csharp" },
  { label: "C++", value: "cpp" },
  { label: "Pascal", value: "pascal" },
];

type Props = {
  variant?: "light" | "dark";
};

const LanguageSwitch = ({ variant = "light" }: Props) => {
  const [state, actions] = useTable();

  return (
    <Segmented
      aria-label="Мова прикладів коду"
      className={`lang-switch${variant === "dark" ? " lang-switch--dark" : ""}`}
      options={LANGUAGE_OPTIONS}
      value={state.codeOption}
      onChange={(value) => actions.setCodeOption(String(value))}
    />
  );
};

export default LanguageSwitch;
