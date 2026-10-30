import Api from "./api-service";
import { Exercise, ExerciseCheckResult, ExerciseEdit, QuestionAnswer } from "../models/Exercise";

const ExerciseService = {
  getForTopic: async (pageId: number, subPageId?: number): Promise<Exercise[]> =>
    (await Api.get("Exercises", { pageId, subPageId })).data,

  getForEdit: async (id: number): Promise<ExerciseEdit> =>
    (await Api.get(`Exercises/${id}/edit`)).data,

  create: async (exercise: ExerciseEdit): Promise<number> =>
    (await Api.post("Exercises", exercise)).data.id,

  update: async (exercise: ExerciseEdit): Promise<void> => {
    await Api.put(`Exercises/${exercise.Id}`, exercise);
  },

  remove: async (id: number): Promise<void> => {
    await Api.remove(`Exercises/${id}`);
  },

  check: async (id: number, answers: QuestionAnswer[]): Promise<ExerciseCheckResult> =>
    (await Api.post(`Exercises/${id}/check`, { Answers: answers })).data,
};

export default ExerciseService;
