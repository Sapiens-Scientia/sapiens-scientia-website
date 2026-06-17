# Routes

This is the current public route inventory for the Sapiens Scientia website.

## Primary Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage with Physical Earth / Digital Halo / Meta Earth hero and overview content. |
| `/scales` | `src/app/scales/page.tsx` | Ladder of Scale, from particles to the Sun. |
| `/chronos` | `src/app/chronos/page.tsx` | Arc of Time, from the Big Bang to the present. |
| `/platforms` | `src/app/platforms/page.tsx` | Cross-platform systems map and simulator. |
| `/vitals` | `src/app/vitals/page.tsx` | Planetary vital signs dashboard. |
| `/projects` | `src/app/projects/page.tsx` | Project index. |

## Platform Pages

| Route | File | Purpose |
|---|---|---|
| `/platforms/salus` | `src/app/platforms/salus/page.tsx` | Human health platform. |
| `/platforms/societas` | `src/app/platforms/societas/page.tsx` | Human society platform. |
| `/platforms/terra` | `src/app/platforms/terra/page.tsx` | Environmental / Earth systems platform. |
| `/platforms/salus/soma` | `src/app/platforms/salus/soma/page.tsx` | Human body module inside Salus. |
| `/platforms/salus/morbus` | `src/app/platforms/salus/morbus/page.tsx` | Disease ontology inside Salus. |

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

- `src/components/home-nav.tsx` controls the homepage overlay navigation.
- `src/components/site-nav.tsx` controls standard page navigation.
- `src/components/site-footer.tsx` controls the sitewide footer.
- Public project links are centralized in `src/lib/projects.ts`.

When adding or removing public pages, update this file, navigation, sitemap metadata if needed, and any relevant docs.
