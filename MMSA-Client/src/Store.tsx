import { Action, createHook, createStore } from "react-sweet-state";
import { Page } from "./models/Page";
import { SubPage } from "./models/SubPages";

type State = {
  page: Page;
  subPage?: SubPage;
  selectedMenuItem: string;
  codeOption: string
};

const initialState: State = {
  page: { Id: 0, PageName: "", SubPages: [] },
  subPage: { Id: 0, PageId: 0, Name:"" },
  selectedMenuItem: "",
  codeOption: "cpp"
};

const actions = {
  setPage:
    (newPage: Page): Action<State> =>
    ({ setState }) => {
      setState({
        page: newPage,
      });
    },

  setSubPage:
    (newSubPage?: SubPage): Action<State> =>
    ({ setState }) => {
      setState({
        subPage: newSubPage,
      });
    },

  setSelectedMenuItem:
    (selectedMenuItem: string): Action<State> =>
    ({ setState }) => {
      setState({
        selectedMenuItem: selectedMenuItem
      });
    },

  setCodeOption:
    (selectedCodeOption: string): Action<State> =>
    ({ setState }) => {
      setState({
        codeOption: selectedCodeOption
      });
    },
};

const Store = createStore({ initialState, actions });
export const useTable = createHook(Store);
