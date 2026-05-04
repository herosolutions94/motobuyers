import Link from "next/link";
import Image from "next/image";
import MetaGenerator from "@/components/meta-generator";

export default function NotFound() {
  return (
    <>
      <MetaGenerator page_title={"404 - Page Not Found"} />

      <div className="error_root">
        <div className="error_page">
          <div className="error_wrap">
            <div className="error_img">
              <Image
                src="/images/404.png"
                alt="404"
                width={500}
                height={350}
                priority
              />
            </div>

            <Link href="/" className="site_btn">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
