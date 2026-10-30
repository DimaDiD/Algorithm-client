export type QuestionType = "SingleChoice" | "MultipleChoice" | "ShortAnswer" | "OpenAnswer" | "Code";

export type QuestionOption = {
  Id: number;
  Text: string;
};

export type Question = {
  Id: number;
  Type: QuestionType;
  Text: string;
  Points: number;
  Order: number;
  CodeLanguage?: string | null;
  Options: QuestionOption[];
};

export type Exercise = {
  Id: number;
  Title: string;
  Description?: string | null;
  Order: number;
  Questions: Question[];
};

export type QuestionOptionEdit = {
  Id: number;
  Text: string;
  IsCorrect: boolean;
};

export type QuestionEdit = {
  Id: number;
  Type: QuestionType;
  Text: string;
  Points: number;
  CodeLanguage?: string | null;
  ReferenceAnswer?: string | null;
  Rubric?: string | null;
  Options: QuestionOptionEdit[];
};

export type ExerciseEdit = {
  Id: number;
  PageId: number;
  SubPageId?: number | null;
  Title: string;
  Description?: string | null;
  Order: number;
  Questions: QuestionEdit[];
};

export type QuestionAnswer = {
  QuestionId: number;
  SelectedOptionIds: number[];
  Text?: string;
};

export type QuestionResultStatus = "Correct" | "Incorrect" | "NotChecked";

export type QuestionResult = {
  QuestionId: number;
  Status: QuestionResultStatus;
  EarnedPoints: number;
  MaxPoints: number;
  CorrectOptionIds: number[];
  AcceptedAnswers: string[];
};

export type ExerciseCheckResult = {
  Score: number;
  MaxScore: number;
  Questions: QuestionResult[];
};
