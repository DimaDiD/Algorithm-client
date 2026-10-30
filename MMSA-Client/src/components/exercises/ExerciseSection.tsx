import { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { Exercise, ExerciseEdit } from "../../models/Exercise";
import ExerciseService from "../../services/exerciseService";
import { useCanEditCourse } from "../../course/useCourse";
import { useTable } from "../../Store";
import notification from "../../notification/notificationMessage";
import ExerciseCard from "./ExerciseCard";
import ExerciseEditorModal from "./ExerciseEditorModal";

type Props = {
  pageId: number;
  subPageId?: number;
};

type EditorState = { open: false } | { open: true; exercise?: ExerciseEdit };

const HANDLED_STATUSES = [401, 403, 429];

const ExerciseSection = ({ pageId, subPageId }: Props) => {
  const [state] = useTable();
  const canEdit = useCanEditCourse();
  const [modal, contextHolder] = Modal.useModal();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editor, setEditor] = useState<EditorState>({ open: false });
  const [version, setVersion] = useState(0);

  const isEditing = canEdit && state.isEditMode;

  const load = useCallback(async () => {
    try {
      setExercises(await ExerciseService.getForTopic(pageId, subPageId));
      setVersion((value) => value + 1);
    } catch {
      setExercises([]);
    }
  }, [pageId, subPageId]);

  useEffect(() => {
    load();
  }, [load]);

  const openEditor = async (exerciseId?: number) => {
    if (exerciseId === undefined) {
      setEditor({ open: true });
      return;
    }
    try {
      setEditor({ open: true, exercise: await ExerciseService.getForEdit(exerciseId) });
    } catch (error) {
      if (!(axios.isAxiosError(error) && HANDLED_STATUSES.includes(error.response?.status ?? 0))) {
        notification("error", "Не вдалося завантажити завдання.");
      }
    }
  };

  const confirmDelete = (exercise: Exercise) =>
    modal.confirm({
      title: `Видалити «${exercise.Title}»?`,
      content: "Завдання і всі його питання буде видалено.",
      okText: "Видалити",
      okButtonProps: { danger: true },
      cancelText: "Скасувати",
      onOk: async () => {
        try {
          await ExerciseService.remove(exercise.Id);
          notification("success", "Завдання видалено.");
          await load();
        } catch {
          notification("error", "Не вдалося видалити завдання.");
        }
      },
    });

  const handleSaved = async () => {
    setEditor({ open: false });
    notification("success", "Завдання збережено.");
    await load();
  };

  if (exercises.length === 0 && !isEditing) return null;

  return (
    <section className="exercise-section" aria-labelledby="exercise-section-title">
      <div className="exercise-section__head">
        <h2 id="exercise-section-title" className="exercise-section__title">Перевір себе</h2>
        {isEditing && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            Додати завдання
          </Button>
        )}
      </div>

      {exercises.length === 0 && (
        <div className="card exercise-empty">До цієї теми ще немає завдань.</div>
      )}

      {exercises.map((exercise) => (
        <ExerciseCard
          key={`${exercise.Id}-${version}`}
          exercise={exercise}
          isEditing={isEditing}
          onEdit={() => openEditor(exercise.Id)}
          onDelete={() => confirmDelete(exercise)}
        />
      ))}

      <ExerciseEditorModal
        open={editor.open}
        pageId={pageId}
        subPageId={subPageId}
        exercise={editor.open ? editor.exercise : undefined}
        onCancel={() => setEditor({ open: false })}
        onSaved={handleSaved}
      />
      {contextHolder}
    </section>
  );
};

export default ExerciseSection;
