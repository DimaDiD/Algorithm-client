import { Switch } from "antd";
import { CodeOutlined, MenuOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useTable } from "../../Store";
import { coursePath } from "../../course/courseUtils";
import AuthPanel from "../auth/AuthPanel";

type Props = {
  onOpenNavigation?: () => void;
  courseSlug?: string;
  showEditToggle?: boolean;
};

const AppHeader = ({ onOpenNavigation, courseSlug, showEditToggle = false }: Props) => {
  const [state, actions] = useTable();

  return (
    <header className="app-header">
      <div className="container app-header__inner">
        {onOpenNavigation && (
          <button type="button" className="icon-button only-mobile" aria-label="Відкрити зміст" onClick={onOpenNavigation}>
            <MenuOutlined />
          </button>
        )}

        <Link to="/" className="app-logo">
          <span className="app-logo__mark" aria-hidden="true">
            <CodeOutlined />
          </span>
          <span className="app-logo__text">Основи програмування</span>
        </Link>

        <nav className="app-header__nav" aria-label="Головна навігація">
          <Link to="/#courses">Курси</Link>
          {courseSlug && <Link to={`${coursePath(courseSlug)}#contents`}>Зміст</Link>}
        </nav>

        <div className="app-header__actions">
          {showEditToggle && (
            <label className="edit-toggle">
              <span className="edit-toggle__label">Режим редагування</span>
              <Switch
                checked={state.isEditMode}
                onChange={(checked) => actions.setEditMode(checked)}
                aria-label="Режим редагування"
              />
            </label>
          )}
          <AuthPanel />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
