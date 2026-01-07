export function parseMarkdown(text, darkMode = false) {
  if (!text) return '';

  const lines = text.split('\n');
  const html = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    if (line.match(/^#{1,3}\s/)) {
      const level = line.match(/^#+/)[0].length;
      const content = line.substring(level + 1).trim();
      const tagName = `h${level}`;
      const sizeClass =
        level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl';
      const colorClass =
        level === 1
          ? darkMode
            ? 'text-blue-400'
            : 'text-blue-700'
          : level === 2
          ? darkMode
            ? 'text-purple-400'
            : 'text-purple-700'
          : darkMode
          ? 'text-pink-400'
          : 'text-pink-700';
      const marginClass = level === 1 ? 'mt-6 mb-3' : 'mt-4 mb-2';

      html.push(
        `<${tagName} class="font-bold ${sizeClass} ${colorClass} ${marginClass}">${escapeHtml(content)}</${tagName}>`
      );
      continue;
    }

    // Unordered lists
    if (line.match(/^[\s]*[-•]\s/)) {
      const content = line.replace(/^[\s]*[-•]\s/, '').trim();
      const indent = line.search(/[-•]/);
      const indentLevel = Math.floor(indent / 2);
      const marginClass = indentLevel > 0 ? `ml-${indentLevel * 4}` : 'ml-0';

      html.push(
        `<div class="flex items-start mb-2 ${marginClass}"><span class="${
          darkMode ? 'text-blue-400' : 'text-blue-600'
        } mr-3 font-bold">•</span><span class="${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }">${escapeHtml(content)}</span></div>`
      );
      continue;
    }

    // Ordered lists
    if (line.match(/^[\s]*\d+\.\s/)) {
      const match = line.match(/^[\s]*(\d+)\.\s/);
      const num = match[1];
      const content = line.substring(match[0].length).trim();
      const indent = line.search(/\d/);
      const indentLevel = Math.floor(indent / 2);
      const marginClass = indentLevel > 0 ? `ml-${indentLevel * 4}` : 'ml-0';

      html.push(
        `<div class="flex items-start mb-2 ${marginClass}"><span class="${
          darkMode ? 'text-purple-400' : 'text-purple-600'
        } mr-3 font-bold">${num}.</span><span class="${
          darkMode ? 'text-gray-300' : 'text-gray-900'  
        }">${escapeHtml(content)}</span></div>`
      );
      continue;
    }

    // Code blocks (triple backticks)
    if (line.startsWith('```')) {
      const language = line.substring(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
       html.push(
        `<pre class="${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        } text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto"><code>${
          darkMode ? 'text-gray-200' : 'text-gray-900'  
        }">${escapeHtml(
          codeLines.join('\n')
        )}</code></pre>`
      );
      continue;
    }

    // Inline code and formatting
    if (line.trim()) {
      let formattedLine = escapeHtml(line);

      // Bold
      formattedLine = formattedLine.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-bold">$1</strong>'
      );
      formattedLine = formattedLine.replace(
        /__(.+?)__/g,
        '<strong class="font-bold">$1</strong>'
      );

      // Italic
      formattedLine = formattedLine.replace(
        /\*(.*?)\*/g,
        '<em class="italic">$1</em>'
      );
      formattedLine = formattedLine.replace(
        /_(.*?)_/g,
        '<em class="italic">$1</em>'
      );

      // Inline code
      formattedLine = formattedLine.replace(
        /`([^`]+)`/g,
        `<code class="${
          darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'
        } px-2 py-1 rounded text-sm font-mono">$1</code>`
      );

      // Links
      formattedLine = formattedLine.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-500 hover:underline" target="_blank">$1</a>'
      );

      html.push(
        `<p class="mb-4 leading-relaxed ${
          darkMode ? 'text-gray-300' : 'text-gray-900'
        }">${formattedLine}</p>`
      );
      continue;
    }

    // Empty lines - preserve spacing
    if (line.trim() === '') {
      html.push('<div class="mb-2"></div>');
    }
  }

  return html.join('');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}