import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Input, Radio } from "antd";
import {
  BarChartOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  EditOutlined,
  MinusCircleFilled,
  ReloadOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import {
  Exercise,
  ExerciseCheckResult,
  ExerciseProgress,
  Question,
  QuestionAnswer,
  QuestionResult,
} from "../../models/Exercise";
import { pluralize } from "../../course/courseUtils";
import ExerciseService from "../../services/exerciseService";
import notification from "../../notification/notificationMessage";
import { getErrorMessages } from "../../auth/authApi";

type AnswerState = {
  selected: number[];
  text: string;
};

type Props = {
  exercise: Exercise;
  isEditing: boolean;
  isCourseEditor: boolean;
  progress?: ExerciseProgress;
  onEdit: () => void;
  onDelete: () => void;
  onStats: () => void;
  onChecked: () => void;
};

const EMPTY_ANSWER: AnswerState = { selected: [], text: "" };

const DEFAULT_OPEN_ANSWER_LENGTH = 2000;

const isTextQuestion = (question: Question) => question.Type === "ShortAnswer" || question.Type === "OpenAnswer";

const isAnswered = (question: Question, answer?: AnswerState) =>
  !!answer && (isTextQuestion(question) ? answer.text.trim().length > 0 : answer.selected.length > 0);

const STATUS_ICONS = {
  Correct: <CheckCircleFilled />,
  PartiallyCorrect: <MinusCircleFilled />,
  Incorrect: <CloseCircleFilled />,
};

const optionClass = (optionId: number, answer: AnswerState, result?: QuestionResult) => {
  if (!result) return "exercise-option";
  if (result.CorrectOptionIds.includes(optionId)) return "exercise-option is-correct";
  if (answer.selected.includes(optionId)) return "exercise-option is-wrong";
  return "exercise-option";
};

const ExerciseCard = ({ exercise, isEditing, isCourseEditor, progress, onEdit, onDelete, onStats, onChecked }: Props) => {
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [result, setResult] = useState<ExerciseCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [openAnswerLength, setOpenAnswerLength] = useState(DEFAULT_OPEN_ANSWER_LENGTH);
  const hasOpenAnswers = exercise.Questions.some((question) => question.Type === "OpenAnswer");

  useEffect(() => {
    if (!hasOpenAnswers) return;
    ExerciseService.getAiStatus()
      .then((status) => setOpenAnswerLength(status.MaxAnswerLength))
      .catch(() => undefined);
  }, [hasOpenAnswers]);

  const totalPoints = useMemo(() => exercise.Questions.reduce((sum, q) => sum + q.Points, 0), [exercise]);
  const answeredCount = exercise.Questions.filter((q) => isAnswered(q, answers[q.Id])).length;
  const resultsById = useMemo(
    () => new Map((result?.Questions ?? []).map((item) => [item.QuestionId, item])),
    [result]
  );

  const setAnswer = (questionId: number, patch: Partial<AnswerState>) =>
    setAnswers((previous) => ({
      ...previous,
      [questionId]: { ...(previous[questionId] ?? EMPTY_ANSWER), ...patch },
    }));

  const check = async () => {
    const payload: QuestionAnswer[] = exercise.Questions.map((question) => {
      const answer = answers[question.Id] ?? EMPTY_ANSWER;
      return { QuestionId: question.Id, SelectedOptionIds: answer.selected, Text: answer.text };
    });

    setIsChecking(true);
    try {
      setResult(await ExerciseService.check(exercise.Id, payload));
      onChecked();
    } catch (error) {
      const messages = getErrorMessages(error);
      notification("error", messages[0] ?? "Не вдалося перевірити відповіді. Спробуйте ще раз.");
    } finally {
      setIsChecking(false);
    }
  };

  const retry = () => {
    setResult(null);
    setAnswers({});
  };

  const renderQuestionBody = (question: Question) => {
    const answer = answers[question.Id] ?? EMPTY_ANSWER;
    const questionResult = resultsById.get(question.Id);
    const isLocked = result !== null;

    if (question.Type === "SingleChoice") {
      return (
        <Radio.Group
          className="exercise-options"
          value={answer.selected[0]}
          disabled={isLocked}
          onChange={(event) => setAnswer(question.Id, { selected: [event.target.value] })}
        >
          {question.Options.map((option) => (
            <Radio key={option.Id} value={option.Id} className={optionClass(option.Id, answer, questionResult)}>
              {option.Text}
            </Radio>
          ))}
        </Radio.Group>
      );
    }

    if (question.Type === "MultipleChoice") {
      return (
        <Checkbox.Group
          className="exercise-options"
          value={answer.selected}
          disabled={isLocked}
          onChange={(values) => setAnswer(question.Id, { selected: values as number[] })}
        >
          {question.Options.map((option) => (
            <Checkbox key={option.Id} value={option.Id} className={optionClass(option.Id, answer, questionResult)}>
              {option.Text}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );
    }

    if (question.Type === "ShortAnswer") {
      return (
        <div className="exercise-short">
          <Input
            size="large"
            placeholder="Ваша відповідь"
            value={answer.text}
            disabled={isLocked}
            maxLength={500}
            status={questionResult?.Status === "Incorrect" ? "error" : undefined}
            onChange={(event) => setAnswer(question.Id, { text: event.target.value })}
            onPressEnter={() => !isLocked && check()}
          />
          {questionResult?.Status === "Incorrect" && questionResult.AcceptedAnswers.length > 0 && (
            <span className="exercise-hint">Правильна відповідь: {questionResult.AcceptedAnswers.join(" або ")}</span>
          )}
        </div>
      );
    }

    if (question.Type === "OpenAnswer") {
      return (
        <div className="exercise-open">
          <Input.TextArea
            placeholder="Напишіть відповідь своїми словами"
            value={answer.text}
            disabled={isLocked}
            maxLength={openAnswerLength}
            showCount
            autoSize={{ minRows: 3, maxRows: 12 }}
            onChange={(event) => setAnswer(question.Id, { text: event.target.value })}
          />
          {questionResult?.Feedback && (
            <div className={`exercise-feedback${questionResult.IsAiReviewed ? "" : " exercise-feedback--muted"}`} role="status">
              {questionResult.IsAiReviewed && (
                <span className="exercise-feedback__title">
                  <RobotOutlined /> Відгук AI
                </span>
              )}
              <p className="exercise-feedback__text">{questionResult.Feedback}</p>
              {questionResult.IsAiReviewed && (
                <span className="exercise-feedback__note">Оцінка AI рекомендаційна — орієнтуйтеся на пояснення, а не лише на бали.</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return <span className="exercise-hint">Цей тип завдання поки не підтримується.</span>;
  };

  return (
    <section className="card exercise-card" aria-labelledby={`exercise-${exercise.Id}`}>
      <header className="exercise-card__header">
        <div className="exercise-card__heading">
          <h3 id={`exercise-${exercise.Id}`} className="exercise-card__title">{exercise.Title}</h3>
          <span className="exercise-card__meta">
            {exercise.Questions.length} пит. · {totalPoints} б.
          </span>
          {progress && (
            <span className="exercise-progress">
              Ваш найкращий результат: <strong>{progress.BestScore} з {progress.MaxScore}</strong> ·{" "}
              {pluralize(progress.Attempts, "спроба", "спроби", "спроб")}
            </span>
          )}
        </div>
        {isEditing && (
          <div className="exercise-card__tools">
            <Button icon={<BarChartOutlined />} onClick={onStats}>
              Статистика
            </Button>
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Редагувати
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={onDelete} aria-label="Видалити завдання" />
          </div>
        )}
      </header>

      {exercise.Description && <p className="exercise-card__description">{exercise.Description}</p>}

      <ol className="exercise-questions">
        {exercise.Questions.map((question, index) => {
          const questionResult = resultsById.get(question.Id);
          return (
            <li key={question.Id} className="exercise-question">
              <div className="exercise-question__head">
                <span className="exercise-question__number">{index + 1}</span>
                <p className="exercise-question__text">{question.Text}</p>
                {questionResult && questionResult.Status !== "NotChecked" ? (
                  <span className={`exercise-status exercise-status--${questionResult.Status.toLowerCase()}`}>
                    {STATUS_ICONS[questionResult.Status]}
                    {questionResult.EarnedPoints}/{questionResult.MaxPoints}
                  </span>
                ) : (
                  <span className="exercise-question__points">{question.Points} б.</span>
                )}
              </div>
              {question.Type === "MultipleChoice" && !result && (
                <span className="exercise-hint">Можна обрати кілька варіантів</span>
              )}
              {renderQuestionBody(question)}
            </li>
          );
        })}
      </ol>

      <footer className="exercise-card__footer">
        {result ? (
          <>
            <div className="exercise-score" role="status">
              <span className="exercise-score__value">
                {result.Score} з {result.MaxScore}
              </span>
              <span className="exercise-score__label">
                {result.MaxScore === 0
                  ? "Цього разу відповіді не вдалося оцінити автоматично."
                  : result.Score === result.MaxScore
                    ? "Чудово, усе правильно!"
                    : "Перегляньте помилки й спробуйте ще раз."}
              </span>
              {isCourseEditor && (
                <span className="exercise-hint">Ви автор курсу — ця спроба не потрапила до статистики.</span>
              )}
            </div>
            <Button size="large" icon={<ReloadOutlined />} onClick={retry}>
              Спробувати ще раз
            </Button>
          </>
        ) : (
          <>
            <span className="exercise-card__progress">
              {hasOpenAnswers && isChecking
                ? "Розгорнуті відповіді перевіряє AI — це може тривати до півхвилини."
                : `Відповідей: ${answeredCount} з ${exercise.Questions.length}`}
            </span>
            <Button type="primary" size="large" loading={isChecking} disabled={answeredCount === 0} onClick={check}>
              {isChecking && hasOpenAnswers ? "AI перевіряє…" : "Перевірити"}
            </Button>
          </>
        )}
      </footer>
    </section>
  );
};

export default ExerciseCard;
