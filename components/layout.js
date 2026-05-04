import SiteMaster from "./sitemaster";
// import { useRouter } from "next/router";
import HeaderComponent from "./HeaderComponent";
import FooterComponent from "./FooterComponent";
export default function Layout({ children, siteSettings, headerServices }) {
  // const router = useRouter();
  // const path = router.pathname;
  return (
    <>
      <SiteMaster siteSettings={siteSettings} />
      <HeaderComponent siteSettings={siteSettings} />
      {children}
      <FooterComponent siteSettings={siteSettings} />
    </>
  );
}
