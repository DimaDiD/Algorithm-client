import { Link } from "react-router-dom";

const AppFooter = () => (
  <footer className="app-footer">
    <div className="container app-footer__inner">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="app-footer__title">Методи розробки алгоритмів</span>
        <span>Навчальний курс з прикладами на C#, C++ і Pascal · {new Date().getFullYear()}</span>
      </div>
      <nav aria-label="Посилання у футері" style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
        <Link to="/#contents">Зміст курсу</Link>
      </nav>
    </div>
  </footer>
);

export default AppFooter;
