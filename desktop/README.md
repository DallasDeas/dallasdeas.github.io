# Dallas Workspace

A GitHub Pages-compatible desktop portfolio inspired by the supplied website reference video. Built with HTML, CSS and JavaScript; no build step or server backend is required for the published site.

## Included behavior

- Desktop shortcuts, dock, clock and profile widget.
- Draggable and resizable windows; close, minimize, restore and maximize controls.
- Project explorer connected to the existing Active Directory, Cisco and Azure documentation.
- Portfolio terminal with command history and `help`, `about`, `projects`, `skills`, `certs`, `resume`, `contact`, `open`, `ls`, `whoami`, `pwd`, `date`, and `clear`.
- Headshot, résumé preview/download, professional links and copy-email action.
- Animated rain, reduced-motion support and saved appearance preferences.
- Optional browser-generated ambient rain sound; no autoplay or external music files.
- A clearly labeled portfolio guide with predefined answers. No live AI service or API keys.
- Responsive phone panels and keyboard navigation. On phones, background windows are inert so keyboard focus stays in the selected window.
- Original homepage retained at `/classic/`; `/home/` opens `/desktop/`.

## Local preview

Serve the repository root over HTTP, for example `python -m http.server 8765 --bind 127.0.0.1`, then visit `http://127.0.0.1:8765/desktop/`. Root-relative paths are intended for the user-site repository `DallasDeas/dallasdeas.github.io`.

## Asset notes

`assets/headshot.webp` uses the headshot supplied in the reference conversation. `assets/Dallas_Deas_Resume.pdf` is copied from the project's résumé source. Review personal information before public deployment.

`assets/atlanta-night.webp` was generated with the built-in ImageGen tool. Final prompt:

> Use case: stylized-concept. Asset type: widescreen desktop wallpaper for Dallas Deas personal IT portfolio. Create a cinematic illustrated Atlanta-inspired city skyline at midnight, seen from a rooftop high above the city. Deep ink navy sky, luminous blue moon in upper left, layered billowing blue clouds, distant skyscrapers including a pointed Atlanta-style tower toward the right, rain-wet rooftops with tiny red warning lights and subtle cyan-lit windows. Calm dramatic atmospheric digital painting, detailed architectural silhouettes, premium video-game concept art aesthetic. Wide 16:9 composition, large dark uncluttered sky and midground on the left and center for floating interface windows, detailed city mainly in bottom third and right half. Deep blue, slate, muted cyan and tiny red accents. No people, no superhero, no text, no logos, no UI, no watermark. This is background art only, not a website mockup.

Fonts use Google Fonts with local system fallbacks. The illustrated skyline is an Atlanta-inspired concept, not a geographically accurate photograph.
