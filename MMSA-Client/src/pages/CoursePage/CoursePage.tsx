import { useEffect, useMemo, useState } from "react";
import { Result, Skeleton } from "antd";
import { ArrowRightOutlined, SettingOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTable } from "../../Store";
import { flattenTopics, pluralWord, pluralizeTopics, sectionTopics } from "../../course/courseUtils";
import { useCanEditCourse, useLoadCourse } from "../../course/useCourse";
import MainService from "../../services/mainService";
import { getErrorMessages } from "../../auth/authApi";
import notification from "../../notification/notificationMessage";
import AppHeader from "../../components/layout/AppHeader";
import AppFooter from "../../components/layout/AppFooter";
import NameModal from "../../components/course/NameModal";
import CourseEditorModal from "../../components/course/CourseEditorModal";

export const CoursePage = () => {
  const { courseSlug = "" } = useParams();
  const state = useLoadCourse(courseSlug);
  const [, actions] = useTable();
  const canEditCourse = useCanEditCourse();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useMemo(() => new MainService(), []);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  const course = state.course?.Slug === courseSlug ? state.course : null;
  const isLoaded = !!course && state.isMenuLoaded;
  const isEditing = canEditCourse && state.isEditMode;
  const firstTopic = useMemo(() => flattenTopics(courseSlug, state.menu)[0], [courseSlug, state.menu]);
  const topicCount = useMemo(() => flattenTopics(courseSlug, state.menu).length, [courseSlug, state.menu]);

  useEffect(() => {
    document.title = course ? course.Title : "Основи програмування";
  }, [course]);

  useEffect(() => {
    if (location.hash && isLoaded) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash, isLoaded]);

  const addSection = async (name: string) => {
    if (!course) return;
    try {
      await api.CreatePage(course.Id, name);
      await actions.loadMenu();
      setIsAddSectionOpen(false);
      notification("success", "Розділ додано.");
    } catch (error) {
      notification("error", getErrorMessages(error)[0]);
      throw error;
    }
  };

  if (state.courseStatus === "notFound" || state.courseStatus === "error") {
    const isNotFound = state.courseStatus === "notFound";
    return (
      <div className="page">
        <AppHeader />
        <main className="container section">
          <div className="card topic-card">
            <Result
              status={isNotFound ? "404" : "error"}
              title={isNotFound ? "Курс не знайдено" : "Не вдалося завантажити курс"}
              subTitle={isNotFound ? "Можливо, його ще не опубліковано або видалено." : "Спробуйте оновити сторінку."}
              extra={<Link to="/" className="btn btn--primary">До каталогу курсів</Link>}
            />
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="page">
      <AppHeader courseSlug={courseSlug} showEditToggle={canEditCourse} />

      <main>
        <section className="container course-hero">
          {!course ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <>
              <nav className="breadcrumbs" aria-label="Навігаційний ланцюжок">
                <Link to="/">Курси</Link>
                <span aria-hidden="true">/</span>
                <span className="breadcrumbs__current" aria-current="page">{course.Title}</span>
              </nav>
              <div className="course-hero__title-row">
                <h1 className="hero__title course-hero__title">{course.Title}</h1>
                {!course.IsPublished && <span className="status-badge">Чернетка</span>}
              </div>
              {course.Description && <p className="hero__lead">{course.Description}</p>}
              {course.Languages.length > 0 && (
                <div className="course-card__languages">
                  {course.Languages.map((language) => (
                    <span key={language.Code} className="language-chip">{language.Name}</span>
                  ))}
                </div>
              )}
              <div className="hero__actions">
                {firstTopic && (
                  <Link to={firstTopic.path} className="btn btn--primary">
                    Почати навчання <ArrowRightOutlined />
                  </Link>
                )}
                {canEditCourse && (
                  <button type="button" className="btn btn--ghost" onClick={() => setIsSettingsOpen(true)}>
                    <SettingOutlined /> Налаштування курсу
                  </button>
                )}
              </div>
              {isLoaded && (
                <div className="hero__stats">
                  <div className="stat">
                    <span className="stat__value">{state.menu.length}</span>
                    <span className="stat__label">{pluralWord(state.menu.length, "розділ", "розділи", "розділів")}</span>
                  </div>
                  <div className="stat">
                    <span className="stat__value">{topicCount}</span>
                    <span className="stat__label">{pluralWord(topicCount, "тема", "теми", "тем")}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section id="contents" className="container section">
          <div className="section__head">
            <div>
              <h2 className="section__title">Зміст курсу</h2>
              <p className="section__lead">Розділи впорядковані від простого до складного.</p>
            </div>
            {isEditing && (
              <button type="button" className="btn btn--primary" onClick={() => setIsAddSectionOpen(true)}>
                + Додати розділ
              </button>
            )}
          </div>

          {!isLoaded ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : state.menu.length === 0 ? (
            <div className="card empty-state">
              <p>
                {canEditCourse
                  ? "У курсі ще немає розділів. Увімкніть режим редагування і додайте перший."
                  : "Автор ще не додав жодного розділу."}
              </p>
            </div>
          ) : (
            <div className="cards-grid">
              {state.menu.map((page, index) => {
                const topics = sectionTopics(courseSlug, page);
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
      </main>

      <AppFooter />

      {canEditCourse && course && (
        <>
          <CourseEditorModal
            open={isSettingsOpen}
            course={course}
            onClose={() => setIsSettingsOpen(false)}
            onSaved={(updated) => {
              actions.setCourse(updated);
              setIsSettingsOpen(false);
            }}
            onDeleted={() => {
              setIsSettingsOpen(false);
              actions.clearCourse();
              navigate("/", { replace: true });
            }}
          />
          <NameModal
            open={isAddSectionOpen}
            title="Новий розділ"
            label="Назва розділу"
            okText="Додати"
            initialValue=""
            onCancel={() => setIsAddSectionOpen(false)}
            onSubmit={addSection}
          />
        </>
      )}
    </div>
  );
};

export default CoursePage;
