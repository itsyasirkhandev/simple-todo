/*
 * File Name:     gsapConfig.ts
 * Description:   Central GSAP configuration. Registers all plugins once.
 *                Import gsap and useGSAP exclusively from this file.
 * Author:        Project Team
 * Created Date:  2026-02-25
 */

"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register all plugins here — once, globally
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
