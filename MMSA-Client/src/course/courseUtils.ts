import { Page } from "../models/Page";
import { SubPage } from "../models/SubPages";

export type Topic = {
  page: Page;
  subPage?: SubPage;
  title: string;
  path: string;
};

export const topicPath = (page: Page, subPage?: SubPage): string =>
  subPage
    ? `/${encodeURIComponent(page.PageName)}/${encodeURIComponent(subPage.Name)}`
    : `/${encodeURIComponent(page.PageName)}`;

const toTopic = (page: Page, subPage?: SubPage): Topic => ({
  page,
  subPage,
  title: subPage?.Name ?? page.PageName,
  path: topicPath(page, subPage),
});

export const sectionTopics = (page: Page): Topic[] =>
  page.SubPages.length === 0
    ? [toTopic(page)]
    : page.SubPages.map((subPage) => toTopic(page, subPage));

export const flattenTopics = (menu: Page[]): Topic[] => menu.flatMap(sectionTopics);

export const findTopic = (menu: Page[], pageName?: string, subPageName?: string): Topic | undefined => {
  const page = menu.find((item) => item.PageName === pageName);
  if (!page) return undefined;

  if (!subPageName) return toTopic(page);

  const subPage = page.SubPages.find((item) => item.Name === subPageName);
  return subPage ? toTopic(page, subPage) : undefined;
};

export const pluralizeTopics = (count: number): string => {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} тем`;
  if (last === 1) return `${count} тема`;
  if (last >= 2 && last <= 4) return `${count} теми`;
  return `${count} тем`;
};
