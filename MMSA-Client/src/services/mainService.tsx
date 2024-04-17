import Api from "./api-service";

export default class MainService {
  getMenuItems = async () => {
    return (await Api.get(`Page/GetMenuItems`)).data;
  };

  CreatePage = async (pageName: string) => {
    return (await Api.post(`Page/CreatePage?pageName=${pageName}`))
  };

  CreateSubPage = async (pageName: string, subPageName: string) => {
    return (await Api.post(`SubPage/CreateSubPage?pageName=${pageName}&subPageName=${subPageName}`))
  };
}