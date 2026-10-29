import { useEffect, useMemo } from "react";
import { Skeleton } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useTable } from "../../Store";
import { flattenTopics, pluralizeTopics, sectionTopics } from "../../course/courseUtils";
import AppHeader from "../../components/layout/AppHeader";
import AppFooter from "../../components/layout/AppFooter";
import LanguageSwitch from "../../components/course/LanguageSwitch";
import CodeContent from "../../PageContentTypes/CodeContent";

const SAMPLE_CODE: Record<string, string> = {
  csharp: `int m = k;            // m починається як k
while (n % m == 0)
{
    Console.Write(k + " x ");
    m *= k;           // наступний степінь k
}`,
  cpp: `int m = k;            // m починається як k
while (n % m == 0)
{
    cout << k << " x ";
    m *= k;           // наступний степінь k
}`,
  pascal: `m := k;               { m починається як k }
while n mod m = 0 do
begin
  Write(k, ' x ');
  m := m * k;         { наступний степінь k }
end;`,
};

const STEPS = [
  { title: "Умова задачі", text: "Чітке формулювання: що дано і що треба отримати." },
  { title: "Розбір ідеї", text: "Покрокове пояснення, чому рішення працює." },
  { title: "Код обраною мовою", text: "Готовий приклад на C#, C++ або Pascal з коментарями." },
];

export const HomePage = () => {
  const [state, actions] = useTable();
  const location = useLocation();

  useEffect(() => {
    if (!state.isMenuLoaded) actions.loadMenu();
  }, [state.isMenuLoaded, actions]);

  useEffect(() => {
    if (location.hash && state.isMenuLoaded) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash, state.isMenuLoaded]);

  const firstTopic = useMemo(() => flattenTopics(state.menu)[0], [state.menu]);

  return (
    <div className="page">
      <AppHeader />

      <main>
        <section className="container hero">
          <div className="hero__text">
            <span className="eyebrow">Навчальний курс з алгоритмізації</span>
            <h1 className="hero__title">
              Методи розробки <span>алгоритмів</span>
            </h1>
            <p className="hero__lead">
              Задачі з поясненнями та готовими прикладами коду мовами C#, C++ і Pascal. Оберіть мову один раз — і всі
              приклади курсу підлаштуються під неї.
            </p>
            <div className="hero__actions">
              {firstTopic && (
                <Link to={firstTopic.path} className="btn btn--primary">
                  Почати навчання <ArrowRightOutlined />
                </Link>
              )}
              <a href="#contents" className="btn btn--ghost">
                Переглянути зміст
              </a>
            </div>
            <div className="hero__stats">
              <div className="stat">
                <span className="stat__value">{state.isMenuLoaded ? state.menu.length : "…"}</span>
                <span className="stat__label">розділів курсу</span>
              </div>
              <div className="stat">
                <span className="stat__value">3</span>
                <span className="stat__label">мови програмування</span>
              </div>
              <div className="stat">
                <span className="stat__value">Відкрито</span>
                <span className="stat__label">читання без реєстрації</span>
              </div>
            </div>
          </div>

          <div className="hero-code">
            <div className="hero-code__top">
              <LanguageSwitch variant="dark" />
              <span className="hero-code__caption">Приклад: розкладання на прості множники</span>
            </div>
            <CodeContent code={SAMPLE_CODE[state.codeOption] ?? SAMPLE_CODE.csharp} language={state.codeOption} showHeader={false} />
          </div>
        </section>

        <section id="contents" className="container section">
          <div>
            <h2 className="section__title">Зміст курсу</h2>
            <p className="section__lead">Розділи впорядковані від простого до складного.</p>
          </div>

          {!state.isMenuLoaded ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <div className="cards-grid">
              {state.menu.map((page, index) => {
                const topics = sectionTopics(page);
                return (
                  <Link key={page.Id} to={topics[0].path} className="card section-card">
                    <span className="section-card__badge" aria-hidden="true">{index + 1}</span>
                    <h3 className="section-card__title">{page.PageName}</h3>
                    <p className="section-card__meta">
                      {page.SubPages.length > 0 ? pluralizeTopics(page.SubPages.length) : "Окрема сторінка"}
                    </p>
                    <span className="section-card__cta">
                      Відкрити <ArrowRightOutlined />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="container section" style={{ paddingTop: 0 }}>
          <div className="card steps">
            <h2 className="section__title" style={{ fontSize: 30 }}>Як побудована кожна тема</h2>
            <div className="steps__grid">
              {STEPS.map((step, index) => (
                <div key={step.title} className="step">
                  <span className="step__number">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__text">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
};

export default HomePage;
