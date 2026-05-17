import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  getSeoForPath,
} from "../config/site";

const ensureMeta = (
  attribute: "name" | "property",
  key: string,
  content: string,
): void => {
  const selector = `meta[${attribute}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const ensureLink = (rel: string, href: string): void => {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const usePageSeo = (): void => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(pathname);
    const description = seo.description ?? DEFAULT_DESCRIPTION;
    const canonicalPath = seo.path ?? pathname;
    const canonicalUrl = `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;
    const robots = seo.noIndex ? "noindex, nofollow" : "index, follow";

    document.title = seo.title;

    ensureMeta("name", "description", description);
    ensureMeta("name", "keywords", DEFAULT_KEYWORDS);
    ensureMeta("name", "robots", robots);
    ensureMeta("name", "author", SITE_NAME);
    ensureMeta("name", "application-name", SITE_NAME);

    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:site_name", SITE_NAME);
    ensureMeta("property", "og:title", seo.title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:url", canonicalUrl);
    ensureMeta("property", "og:image", DEFAULT_OG_IMAGE);
    ensureMeta("property", "og:locale", "en_US");

    ensureMeta("name", "twitter:card", "summary_large_image");
    ensureMeta("name", "twitter:title", seo.title);
    ensureMeta("name", "twitter:description", description);
    ensureMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
    if (TWITTER_HANDLE) {
      ensureMeta("name", "twitter:site", TWITTER_HANDLE);
    }

    ensureLink("canonical", canonicalUrl);
  }, [pathname]);
};
