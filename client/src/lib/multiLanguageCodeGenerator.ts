export type ProgrammingLanguage = 
  | "html" 
  | "react" 
  | "vue" 
  | "angular" 
  | "python" 
  | "nodejs";

export interface LanguageTemplate {
  name: string;
  extension: string;
  template: string;
  framework?: string;
}

export const languageTemplates: Record<ProgrammingLanguage, LanguageTemplate> = {
  html: {
    name: "HTML/CSS/JS",
    extension: "html",
    template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Component</title>
  <style>
    {{CSS}}
  </style>
</head>
<body>
  {{HTML}}
  <script>
    {{JAVASCRIPT}}
  </script>
</body>
</html>`,
  },
  react: {
    name: "React",
    extension: "jsx",
    framework: "React",
    template: `import React, { useState } from 'react';

export default function GeneratedComponent() {
  {{JAVASCRIPT}}

  return (
    <div className="component">
      {{HTML}}
    </div>
  );
}

const styles = \`
  {{CSS}}
\`;`,
  },
  vue: {
    name: "Vue.js",
    extension: "vue",
    framework: "Vue",
    template: `<template>
  <div class="component">
    {{HTML}}
  </div>
</template>

<script>
export default {
  name: 'GeneratedComponent',
  data() {
    return {
      {{JAVASCRIPT}}
    };
  }
};
</script>

<style scoped>
  {{CSS}}
</style>`,
  },
  angular: {
    name: "Angular",
    extension: "ts",
    framework: "Angular",
    template: `import { Component } from '@angular/core';

@Component({
  selector: 'app-generated',
  template: \`
    {{HTML}}
  \`,
  styles: [\`
    {{CSS}}
  \`]
})
export class GeneratedComponent {
  {{JAVASCRIPT}}
}`,
  },
  python: {
    name: "Python (Flask)",
    extension: "py",
    framework: "Flask",
    template: `from flask import Flask, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    html = """{{HTML}}"""
    css = """{{CSS}}"""
    js = """{{JAVASCRIPT}}"""
    
    return render_template_string(f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>{css}</style>
    </head>
    <body>
        {html}
        <script>{js}</script>
    </body>
    </html>
    """)

if __name__ == '__main__':
    app.run(debug=True)`,
  },
  nodejs: {
    name: "Node.js (Express)",
    extension: "js",
    framework: "Express",
    template: `const express = require('express');
const app = express();

const html = \`{{HTML}}\`;
const css = \`{{CSS}}\`;
const js = \`{{JAVASCRIPT}}\`;

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <style>\${css}</style>
    </head>
    <body>
      \${html}
      <script>\${js}</script>
    </body>
    </html>
  \`);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});`,
  },
};

export function generateCodeForLanguage(
  language: ProgrammingLanguage,
  html: string,
  css: string,
  javascript: string
): string {
  const template = languageTemplates[language];
  if (!template) {
    throw new Error(`Unsupported language: ${language}`);
  }

  let code = template.template;
  code = code.replace(/{{HTML}}/g, html);
  code = code.replace(/{{CSS}}/g, css);
  code = code.replace(/{{JAVASCRIPT}}/g, javascript);

  return code;
}

export function getLanguageInfo(language: ProgrammingLanguage): LanguageTemplate {
  return languageTemplates[language];
}

export function getAllLanguages(): Array<{ id: ProgrammingLanguage; name: string }> {
  return Object.entries(languageTemplates).map(([id, template]) => ({
    id: id as ProgrammingLanguage,
    name: template.name,
  }));
}
