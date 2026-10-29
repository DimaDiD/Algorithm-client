import { useEffect, useMemo, useState } from "react";
import { Drawer, Result, Skeleton } from "antd";
import { Link, useParams } from "react-router-dom";
import { useTable } from "../../Store";
import { findTopic, flattenTopics } from "../../course/courseUtils";
import AppHeader from "../../components/layout/AppHeader";
import AppFooter from "../../components/layout/AppFooter";
import CourseNav from "../../components/course/CourseNav";
import LanguageSwitch from "../../components/course/LanguageSwitch";
import TopicContent from "../../components/course/TopicContent";
import Pager from "../../components/course/Pager";

const SITE_TITLE = "Методи розробки алгоритмів";

export const TopicPage = () => {
  const { page: pageName, subPage: subPageName } = useParams();
  const [state, actions] = useTable();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!state.isMenuLoaded) actions.loadMenu();
  }, [state.isMenuLoaded, actions]);

  const topics = useMemo(() => flattenTopics(state.menu), [state.menu]);
  const topic = useMemo(() => findTopic(state.menu, pageName, subPageName), [state.menu, pageName, subPageName]);
  const index = topic ? topics.findIndex((item) => item.path === topic.path) : -1;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setIsNavOpen(false);
  }, [pageName, subPageName]);

  useEffect(() => {
    document.title = topic ? `${topic.title} — ${SITE_TITLE}` : SITE_TITLE;
  }, [topic]);

  const renderNav = () => (
    <CourseNav menu={state.menu} activeTopic={topic} onNavigate={() => setIsNavOpen(false)} />
  );

  return (
    <div className="page">
      <AppHeader onOpenNavigation={() => setIsNavOpen(true)} />

      <div className="container topic-layout">
        <aside className="course-sidebar card">
          {state.isMenuLoaded ? renderNav() : <div style={{ padding: 16 }}><Skeleton active /></div>}
        </aside>

        <main className="topic-main">
          {!state.isMenuLoaded ? (
            <div className="card topic-card">
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          ) : !topic ? (
            <div className="card topic-card">
              <Result
                status="404"
                title="Тему не знайдено"
                subTitle="Можливо, її перейменували або видалили."
                extra={
                  <Link to="/" className="btn btn--primary">
                    На головну
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <article className="card topic-card">
                <div className="topic-card__top">
                  <nav className="breadcrumbs" aria-label="Навігаційний ланцюжок">
                    <Link to="/">Головна</Link>
                    <span aria-hidden="true">/</span>
                    {topic.subPage ? (
                      <>
                        <span>{topic.page.PageName}</span>
                        <span aria-hidden="true">/</span>
                        <span className="breadcrumbs__current" aria-current="page">{topic.subPage.Name}</span>
                      </>
                    ) : (
                      <span className="breadcrumbs__current" aria-current="page">{topic.page.PageName}</span>
                    )}
                  </nav>
                  <LanguageSwitch />
                </div>

                <TopicContent key={topic.path} pageId={topic.page.Id} subPageId={topic.subPage?.Id} />
              </article>

              <Pager previous={index > 0 ? topics[index - 1] : undefined} next={topics[index + 1]} />
            </>
          )}
        </main>
      </div>

      <Drawer
        className="course-nav-drawer"
        title="Зміст курсу"
        placement="left"
        width={320}
        open={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      >
        {state.isMenuLoaded && renderNav()}
      </Drawer>

      <AppFooter />
    </div>
  );
};

export default TopicPage;
