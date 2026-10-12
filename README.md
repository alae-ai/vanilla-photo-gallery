# Vanilla Photo Gallery

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A simple interactive photo gallery built with vanilla HTML, CSS, and JavaScript. Hovering over thumbnail images displays them in a larger preview area.

## Features

- Hover-to-preview image interaction
- Dynamic background image update on hover
- Alt text displayed as caption
- Resets to default state on mouse out

## Project Structure

```
PhotoGallery/
├── index.html
├── css/
│   └── gallery.css
├── js/
│   └── gallery.js
├── tests/
│   ├── dom-stub.js
│   ├── gallery.test.js
│   └── structure.test.js
├── Dockerfile
└── .github/workflows/
    ├── ci.yml
    └── cd.yml
```

## Tests

The gallery is checked with Node's built-in test runner — no dependencies to install.

```bash
npm test
```

The suite covers JavaScript syntax and load-time errors, the behaviour of
`upDate()` and `unDo()`, and the markup contract between `index.html` and
`js/gallery.js` (required files, asset references, alt text, closing tags).

CI and CD both run these tests in a dedicated `test` job that the `build` and
`deploy` jobs depend on, so a failing test blocks the image from being built,
pushed, or deployed.

## Getting Started

No build step needed — just open in a browser:

```bash
git clone https://github.com/alae-ai/vanilla-photo-gallery.git
cd vanilla-photo-gallery
open index.html
```

Or serve locally:

```bash
npx serve .
```
