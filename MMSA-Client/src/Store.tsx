import { Action, createHook, createStore } from "react-sweet-state";
import { Page } from "./models/Page";

type State = {
  page: string;
  subPage: string;
  selectedMenuItem: string;
  // pageFullInfo: Page;
};

const initialState: State = {
  page: "",
  subPage: "",
  selectedMenuItem: "",
};

const actions = {
  setPage:
    (newPage: string): Action<State> =>
    ({ setState }) => {
      setState({
        page: newPage,
      });
    },

  setSubPage:
    (newSubPage: string): Action<State> =>
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
};

const Store = createStore({ initialState, actions });
export const useTable = createHook(Store);
