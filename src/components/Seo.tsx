import { usePageSeo } from "../hooks/usePageSeo";

/** Updates document title and meta tags on route changes (SPA SEO). */
const Seo = () => {
  usePageSeo();
  return null;
};

export default Seo;
