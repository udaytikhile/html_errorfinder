# AccessAble AI — HTML Accessibility Inspector & Error Finder 🔍♿

> An AI-powered web accessibility auditing tool that scans HTML, identifies WCAG 2.1 (AA & AAA) violations, and provides automated one-click remediation using Google Gemini AI.

---

## 🌟 Key Features

- **🔍 Comprehensive Accessibility Scanner**: Analyzes raw HTML markup or URLs for accessibility issues across WCAG 2.1 guidelines (contrast, missing alt text, ARIA attributes, semantic structure, keyboard navigability, and form labels).
- **🤖 AI-Powered Auto-Fixes**: Integrates Google Gemini AI to analyze accessibility issues in context and generate drop-in code fixes with clear explanations.
- **💻 Interactive Code Editor**: Dual-pane editor with live preview, syntax highlighting, and inline issue annotations.
- **📊 Detailed Audit Reports**: Complete breakdown of detected issues categorized by severity (*Critical*, *Serious*, *Moderate*, *Minor*) with WCAG guideline references and impact analysis.
- **📜 Scan History**: Save, review, and track accessibility audit reports over time.
- **⚙️ Configurable Rules & Rulesets**: Customize target WCAG conformance level (A, AA, AAA) and customize scanner strictness.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: Tailwind CSS & Modern UI Components
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTML Parsing**: `htmlparser2`, `domutils`, `dom-serializer`
- **AI Engine**: Google Gemini API (`@google/generative-ai`)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/udaytikhile/html_errorfinder.git

# Navigate to the project directory
cd html_errorfinder

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts local Next.js development server |
| `npm run build` | Builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint checks |
| `npm run test` | Runs QA test suite |

---

## 📄 License

MIT License. Built for accessibility and inclusive web development.
