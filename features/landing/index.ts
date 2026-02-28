/*
 * File Name:     index.ts
 * Description:   Public API for the landing feature module.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

import dynamic from "next/dynamic";

// Standard lazy-loading pattern for feature entry views
export const LandingView = dynamic(() => import("./views/LandingView"), {
    ssr: true,
});
