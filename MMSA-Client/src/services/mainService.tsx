import { PageContent } from "../models/PageContent";
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

  UpdateMenuItem = async (oldTitle: string, newTitle: string) => {
    return (await Api.put(`SubPage/UpdateMenuItem?oldTitle=${oldTitle}&newTitle=${newTitle}`))
  };

  DeleteMenuItem = async (title: string) => {
    return (await Api.remove(`SubPage/DeleteMenuItem?title=${title}`))
  };

  GetPageContentByMenuStatus = async (pageId: number, subPageId?: number) => {
    let path = `PageContent/GetPageContentByMenuStatus?pageId=${pageId}`;
    if(subPageId != undefined){
      path += `&subPageId=${subPageId}`
    }
    
    return (await Api.get(path)).data;
  }

  CreatePageContent = async (pageContent: PageContent) => {
    return (await Api.post(`PageContent/CreatePageContent`, pageContent))
  };

  DeletePageContent = async (pageContentId: number) => {
    return (await Api.remove(`PageContent/DeletePageContent?pageContentId=${pageContentId}`))
  };

  UpdatePageContent = async (pageContent: PageContent) => {
    return (await Api.put(`PageContent/UpdatePageContent`, pageContent))
  };
}