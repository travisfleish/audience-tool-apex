March Moments Port Pack (Step 2 + Optional Step 3)

What this includes
- Step 2 section: Customize Your Audience
- Optional Step 3 section: Customize Your Creative & Channel
- All transitive component dependencies
- Required images/logos
- Theme + Tailwind references needed by these components

Folder contents
- src/components/sections/AudiencesSection.tsx
- src/components/sections/CreativeChannelSection.tsx
- src/components/visualizations/Step3CreativeViz.tsx
- src/components/visualizations/VCU.tsx
- src/components/motion/MotionPrimitives.tsx
- src/components/ui/GeniusStripeRail.tsx
- src/content/marchMadnessMoments.ts
- src/styles/theme.css
- src/index.css
- tailwind.config.ts
- package.json
- public/acme-tv-creative-a-cutout-v2.png
- public/acme-tv-creative-b-cutout-v2.png
- public/genius-assets/green-lines.png
- public/genius-assets/genius_g_logo.svg
- public/genius-assets/bright-green-lines.png
- public/team_logos/VCU_Rams_logo.svg.png
- public/team_logos/Georgetown_Hoyas_logo.svg.png
- public/team_logos/Purdue-Boilermakers-Logo.png
- public/team_logos/Saint-Peters-Peacocks-logo.png

How to use in your new app
1) Copy this folder's src files into matching paths in your new app.
2) Copy this folder's public assets into your new app public folder.
3) Ensure framer-motion is installed.
4) Merge Tailwind/theme tokens:
   - Add gs/accent colors, heading font, and shadow.soft from tailwind.config.ts.
   - Include theme.css variables.
   - Keep section utility classes in index.css:
     - section-shell
     - section-title
     - section-copy
5) Render sections where needed:
   - <AudiencesSection {...content.audiences} />
   - <CreativeChannelSection {...content.creativeAndChannel} />

Notes
- This pack assumes your app already has Step 1.
- If your content model differs, map your data to the shapes in marchMadnessMoments.ts.
