import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { ROUTES } from "@/constants/routes";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: siteConfig.url,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        // If you had a dedicated login page without fragment:
        // {
        //   url: `${siteConfig.url}${ROUTES.AUTH.LOGIN}`,
        //   lastModified: new Date(),
        //   changeFrequency: "monthly",
        //   priority: 0.8,
        // },
        // {
        //   url: `${siteConfig.url}${ROUTES.AUTH.REGISTER}`,
        //   lastModified: new Date(),
        //   changeFrequency: "monthly",
        //   priority: 0.8,
        // },
    ];
}
