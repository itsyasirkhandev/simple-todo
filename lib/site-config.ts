export const siteConfig = {
    name: "Simple Todo",
    description: "A productivity app based on the Eisenhower Matrix to help you prioritize tasks effectively.",
    url: "http://localhost:3000",
    ogImage: "http://localhost:3000/opengraph-image.png",
    links: {
        github: "https://github.com/itsyasirkhandev/simple-todo",
    },
} as const;

export type SiteConfig = typeof siteConfig;
