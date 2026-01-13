const fs = require('fs');
const path = require('path');

const postsDir = './posts';
const outputDir = './dist';
const outputFile = path.join(outputDir, 'index.html');

// Read all markdown files from posts directory
function getMarkdownFiles() {
  if (!fs.existsSync(postsDir)) {
    console.error(`Error: "${postsDir}" directory not found!`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir);
  const markdownFiles = files
    .filter(file => file.endsWith('.md') || file.endsWith('.markdown'))
    .sort();

  return markdownFiles.map(file => {
    const filepath = path.join(postsDir, file);
    const content = fs.readFileSync(filepath, 'utf8');
    return {
      filename: file,
      content: content
    };
  });
}

// Generate the HTML with embedded markdown content
function generateHTML(markdownFiles) {
  const filesData = markdownFiles.map(f => ({
    filename: f.filename,
    content: f.content
  }));
  
  const filesJSON = JSON.stringify(filesData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Viewer</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    
    #sidebar {
      width: 280px;
      background: #f5f5f5;
      border-right: 1px solid #ddd;
      overflow-y: auto;
      padding: 20px;
    }
    
    #sidebar h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #333;
    }
    
    #fileList {
      list-style: none;
    }
    
    #fileList li {
      padding: 10px;
      margin-bottom: 5px;
      cursor: pointer;
      border-radius: 5px;
      transition: background 0.2s;
      word-break: break-word;
    }
    
    #fileList li:hover {
      background: #e0e0e0;
    }
    
    #fileList li.active {
      background: #007bff;
      color: white;
    }
    
    #content {
      flex: 1;
      overflow-y: auto;
      padding: 40px;
    }
    
    #markdown-content {
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    #markdown-content h1 {
      font-size: 2em;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    #markdown-content h2 {
      font-size: 1.5em;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    
    #markdown-content h3 {
      font-size: 1.25em;
      margin-top: 25px;
      margin-bottom: 10px;
    }
    
    #markdown-content p {
      margin-bottom: 15px;
    }
    
    #markdown-content pre {
      background: #f6f8fa;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 15px;
    }
    
    #markdown-content code {
      background: #f6f8fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    #markdown-content pre code {
      background: none;
      padding: 0;
    }
    
    #markdown-content ul, #markdown-content ol {
      margin-left: 25px;
      margin-bottom: 15px;
    }
    
    #markdown-content li {
      margin-bottom: 5px;
    }
    
    #markdown-content blockquote {
      border-left: 4px solid #ddd;
      padding-left: 20px;
      margin: 15px 0;
      color: #666;
    }
    
    #markdown-content a {
      color: #007bff;
      text-decoration: none;
    }
    
    #markdown-content a:hover {
      text-decoration: underline;
    }
    
    #markdown-content img {
      max-width: 100%;
      height: auto;
    }
    
    #markdown-content table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 15px;
    }
    
    #markdown-content th, #markdown-content td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    #markdown-content th {
      background: #f6f8fa;
      font-weight: bold;
    }
    
    .error {
      color: #d9534f;
      padding: 20px;
      background: #f8d7da;
      border-radius: 5px;
      margin: 20px;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    @media (max-width: 768px) {
      body {
        flex-direction: column;
      }
      
      #sidebar {
        width: 100%;
        max-height: 40vh;
        border-right: none;
        border-bottom: 1px solid #ddd;
      }
      
      #content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div id="sidebar">
    <h2>📁 Posts</h2>
    <ul id="fileList"></ul>
  </div>
  
  <div id="content">
    <div id="markdown-content">
      <div class="loading">Select a post to view</div>
    </div>
  </div>

  <script>
    // Configure marked with highlight.js
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      }
    });

    // All markdown content is embedded here
    const markdownFiles = ${filesJSON};
    
    const fileList = document.getElementById('fileList');
    const contentDiv = document.getElementById('markdown-content');

    // Populate file list
    markdownFiles.forEach((file, index) => {
      const li = document.createElement('li');
      li.textContent = file.filename;
      li.onclick = () => renderMarkdown(file.content, li);
      fileList.appendChild(li);
    });

    function renderMarkdown(markdown, listItem) {
      try {
        // Update active state
        document.querySelectorAll('#fileList li').forEach(li => li.classList.remove('active'));
        listItem.classList.add('active');
        
        const html = marked.parse(markdown);
        contentDiv.innerHTML = html;
        
        // Scroll to top
        document.getElementById('content').scrollTop = 0;
      } catch (error) {
        contentDiv.innerHTML = \`<div class="error">Error rendering markdown: \${error.message}</div>\`;
      }
    }

    // Load first file by default
    if (markdownFiles.length > 0) {
      renderMarkdown(markdownFiles[0].content, fileList.firstChild);
    } else {
      contentDiv.innerHTML = '<div class="error">No markdown files found.</div>';
    }
  </script>
</body>
</html>`;
}

// Main
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const markdownFiles = getMarkdownFiles();

if (markdownFiles.length === 0) {
  console.warn('Warning: No markdown files found in posts directory');
}

const html = generateHTML(markdownFiles);
fs.writeFileSync(outputFile, html);

console.log(`✅ Built static site in ${outputDir}/`);
console.log(`   Found ${markdownFiles.length} markdown files:`);
markdownFiles.forEach(file => console.log(`   - ${file.filename}`));
console.log(`\n🚀 Ready to deploy! Upload the dist/ folder to any static host.`);
