# Routes

This is the current public route inventory for the Sapiens Scientia website.

## Primary Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage Big Bang intro that leads into the Observable Universe view. |
| `/observable-universe` | `src/app/observable-universe/page.tsx` | Observable Universe scale view with a central zoom target into the History of Planet Earth. |
| `/history-of-planet-earth` | `src/app/history-of-planet-earth/page.tsx` | Galaxy 3D view of Earth's history in the Milky Way, with links back to Observable Universe and onward to Meta Earth. |
| `/meta-earth` | `src/app/meta-earth/page.tsx` | Meta Earth page with the original Physical Earth / Digital Halo / Meta Earth hero and overview content. |
| `/scales` | `src/app/scales/page.tsx` | Ladder of Scale, from particles to the Sun. |
| `/chronos` | `src/app/chronos/page.tsx` | Arc of Time, from the Big Bang to the present. |
| `/platforms` | `src/app/platforms/page.tsx` | Cross-platform systems map and simulator. |
| `/vitals` | `src/app/vitals/page.tsx` | Planetary vital signs dashboard. |
| `/projects` | `src/app/projects/page.tsx` | Project index. |

## Platform Pages

| Route | File | Purpose |
|---|---|---|
| `/platforms/persona` | `src/app/platforms/persona/page.tsx` | Sapiens Persona platform landing page. |
| `/platforms/societas` | `src/app/platforms/societas/page.tsx` | Human society platform. |
| `/platforms/terra` | `src/app/platforms/terra/page.tsx` | Environmental / Earth systems platform. |
| `/platforms/persona/salus/soma` | `src/app/platforms/persona/salus/soma/page.tsx` | Human body module nested inside Salus. |
| `/platforms/persona/salus` | `src/app/platforms/persona/salus/page.tsx` | Health and welfare module inside Persona. |
| `/platforms/persona/salus/soma/morbus` | `src/app/platforms/persona/salus/soma/morbus/page.tsx` | Disease ontology nested inside Soma. |
| `/platforms/persona/domus` | `src/app/platforms/persona/domus/page.tsx` | Home/domestic life module inside Persona. |

## Project Pages

| Route | File | Purpose |
|---|---|---|
| `/projects/sapiens-scientia-data-index` | `src/app/projects/sapiens-scientia-data-index/page.tsx` | Structured index of public knowledge databases and registries. |
| `/projects/earthview` | `src/app/projects/earthview/page.tsx` | Embedded EarthView 3D project page. |

## API And Metadata Routes

| Route | File | Purpose |
|---|---|---|
| `/api/vital-signs` | `src/app/api/vital-signs/route.ts` | Vital-sign data endpoint. |
| `/robots.txt` | `src/app/robots.ts` | Robots metadata. |
| `/sitemap.xml` | `src/app/sitemap.ts` | Sitemap metadata. |

## Navigation Notes

- `src/components/home-nav.tsx` controls the Meta Earth overlay navigation.
- `src/components/site-nav.tsx` controls standard page navigation.
- `src/components/site-footer.tsx` controls the sitewide footer.
- Public project links are centralized in `src/lib/projects.ts`.

When adding or removing public pages, update this file, navigation, sitemap metadata if needed, and any relevant docs.
