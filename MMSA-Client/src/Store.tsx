import { Action, createHook, createStore } from "react-sweet-state";
import { Page } from "./models/Page";
import MainService from "./services/mainService";

const CODE_OPTION_KEY = "mmsa.codeOption";
const DEFAULT_CODE_OPTION = "csharp";

const readCodeOption = (): string => {
  try {
    return localStorage.getItem(CODE_OPTION_KEY) ?? DEFAULT_CODE_OPTION;
  } catch {
    return DEFAULT_CODE_OPTION;
  }
};

const saveCodeOption = (value: string) => {
  try {
    localStorage.setItem(CODE_OPTION_KEY, value);
  } catch {
  }
};

type State = {
  codeOption: string;
  menu: Page[];
  isMenuLoaded: boolean;
  isEditMode: boolean;
};

const initialState: State = {
  codeOption: readCodeOption(),
  menu: [],
  isMenuLoaded: false,
  isEditMode: false,
};

const api = new MainService();

const actions = {
  setCodeOption:
    (codeOption: string): Action<State> =>
    ({ setState }) => {
      saveCodeOption(codeOption);
      setState({ codeOption });
    },

  setEditMode:
    (isEditMode: boolean): Action<State> =>
    ({ setState }) => {
      setState({ isEditMode });
    },

  loadMenu:
    (): Action<State, void, Promise<void>> =>
    async ({ setState }) => {
      const menu: Page[] = await api.getMenuItems();
      setState({ menu, isMenuLoaded: true });
    },
};

const Store = createStore({ initialState, actions });
export const useTable = createHook(Store);
