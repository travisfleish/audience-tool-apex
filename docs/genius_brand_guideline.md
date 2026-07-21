/* ===================================================
   BRAND DESIGN SYSTEM — COMPLETE FOUNDATION
   =================================================== */


/* ===================================================
   1. FONTS
   =================================================== */

@font-face {
  font-family: "RedHatText";
  src: url("/fonts/RedHatText-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: "RedHatText";
  src: url("/fonts/RedHatText-Medium.woff2") format("woff2");
  font-weight: 500;
  font-display: swap;
}

@font-face {
  font-family: "ESKlarheitKurrentTRIAL";
  src: url("/fonts/ESKlarheitKurrent-Bk_TRIAL.woff2") format("woff2");
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: "ESKlarheitKurrentTRIAL";
  src: url("/fonts/ESKlarheitKurrent-Md_TRIAL.woff2") format("woff2");
  font-weight: 500;
  font-display: swap;
}


/* ===================================================
   2. DESIGN TOKENS
   =================================================== */

:root {
  --color-navy: #0d1226;
  --color-blue: #0000dc;
  --color-purple: #4337a8;
  --color-orange: #fa5d00;
  --color-lightGrey: #f6f7f9;
  --color-snow: #fafafa;
  --color-white: #ffffff;

  --font-heading: "ESKlarheitKurrentTRIAL", system-ui, sans-serif;
  --font-body: "RedHatText", system-ui, sans-serif;

  --radius-md: 0.5rem;

  --space-1: 0.5rem;
  --space-2: 0.75rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --space-6: 3rem;
}


/* ===================================================
   3. RESET + BASE
   =================================================== */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.45;
  letter-spacing: -0.01125em;
  color: var(--color-navy);
  background: var(--color-white);
}


/* ===================================================
   4. TYPOGRAPHY
   =================================================== */

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  margin-top: var(--space-6);
  margin-bottom: var(--space-4);
}

h1 {
  font-size: 2.25rem;
  font-weight: 300;
  line-height: 1.08;
  letter-spacing: -0.03em;
}

h2 {
  font-size: 1.9375rem;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.035em;
}

h3 {
  font-size: 1.8125rem;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02875em;
}

h4 {
  font-size: 1.75rem;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.05em;
}

p {
  margin-top: 0;
  margin-bottom: var(--space-4);
}

strong { font-weight: 500; }

a {
  color: rgba(13,18,38,0.8);
  text-decoration: underline;
  transition: opacity 0.15s ease;
}

a:hover { opacity: 0.7; }


/* ===================================================
   5. LISTS (Prose-Level Rhythm)
   =================================================== */

ul,
ol {
  margin-top: var(--space-4);
  margin-bottom: var(--space-4);
  padding-left: 1.625em;
}

ul { list-style-type: disc; }
ol { list-style-type: decimal; }

li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

li::marker { color: var(--color-navy); }

ul ul,
ol ol,
ul ol,
ol ul {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}


/* ===================================================
   6. BLOCKQUOTE / TABLE / CODE
   =================================================== */

blockquote {
  font-style: italic;
  border-left: 4px solid var(--color-lightGrey);
  padding-left: var(--space-3);
  margin: var(--space-5) 0;
}

hr {
  border: none;
  border-top: 1px solid var(--color-lightGrey);
  margin: var(--space-6) 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--space-5) 0;
}

th, td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-lightGrey);
  text-align: left;
}

th { font-weight: 500; }

code {
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
}

pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
}


/* ===================================================
   7. LAYOUT
   =================================================== */

.container {
  max-width: 80rem;
  margin: 0 auto;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.section-navy {
  background: var(--color-navy);
  color: var(--color-white);
}

.section-navy h1,
.section-navy h2,
.section-navy h3,
.section-navy h4 {
  color: var(--color-white);
}


/* ===================================================
   8. FORM SYSTEM
   =================================================== */

input,
textarea,
select {
  width: 100%;
  min-height: 50px;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-lightGrey);
  background: var(--color-snow);
  transition: border-color 0.15s ease,
              box-shadow 0.15s ease,
              background 0.15s ease;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: 0 0 0 3px rgba(0,0,220,0.15);
  background: var(--color-white);
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group { margin-bottom: 1.5rem; }


/* ===================================================
   9. CARD SYSTEM
   =================================================== */

.card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: 2rem;
  border: 1px solid var(--color-lightGrey);
  transition: transform 0.25s ease,
              box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px -8px rgba(0,0,0,0.08);
}


/* ===================================================
   10. BUTTON SYSTEM (3 VARIANTS)
   =================================================== */

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
}

/* Primary */
.button-primary {
  background: var(--color-blue);
  color: var(--color-white);
}

.button-primary:hover {
  background: var(--color-purple);
  transform: translateY(-2px);
  padding-right: 1.75rem;
}

/* Secondary Navy */
.button-secondary {
  background: var(--color-navy);
  color: var(--color-white);
}

.button-secondary:hover {
  transform: translateY(-2px);
}

/* Outline */
.button-outline {
  background: transparent;
  border: 1px solid var(--color-navy);
  color: var(--color-navy);
}

.button-outline:hover {
  background: var(--color-navy);
  color: var(--color-white);
  padding-left: 1.75rem;
}


/* ===================================================
   11. STAT STYLES
   =================================================== */

.stat-large {
  font-family: var(--font-heading);
  font-size: 3.5rem;
  font-weight: 300;
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.stat-compact {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.1;
}


/* ===================================================
   12. QUOTE STYLES
   =================================================== */

.quote-feature {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1.3;
  border-left: 4px solid var(--color-blue);
  padding-left: 1.5rem;
  margin: 2rem 0;
}

.quote-minimal {
  font-style: italic;
  font-size: 1.125rem;
  opacity: 0.85;
  margin: 2rem 0;
}


/* ===================================================
   13. MOTION HELPERS
   =================================================== */

.fade-in {
  animation: fadeIn 0.6s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.scale-on-hover:hover {
  transform: scale(1.03);
}