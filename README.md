# Capyinvois - Your e-Invois Helper

Simplify Your LHDN e-Invois Validation

Capyinvois is designed to help you effortlessly validate and manage your LHDN e-invois. With just a 2-minute setup, Capyinvois ensures that your buyer information is accurate, saving you countless hours of manual validation.

## Key Features

- **Quick Setup**: Get started in just 2 minutes
- **Accurate Validation**: Automatically verify buyer information to ensure accuracy
- **Time-Saving**: Eliminate the need for manual validation, freeing up your time for more important tasks

## Installation

1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/capyinvois/egndhkgldgccidjkkoinjailjoggdblf)
2. Click "Add to Chrome"
3. Follow the quick 2-minute setup guide

## Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Local Development

1. Clone the repository

```bash
git clone https://github.com/yourusername/capyinvois.git
cd capyinvois
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm dev
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build` directory from your project

### Building for Production

```bash
pnpm build
```

The built extension will be in the `build` directory.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## License

MIT License - See LICENSE file for details
