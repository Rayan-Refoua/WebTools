javascript:(function() {
// By ChatGPT4o
    function downloadFont(url, name) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = name;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
    }

    const fonts = new Set();
    const stylesheets = document.styleSheets;

    for (let i = 0; i < stylesheets.length; i++) {
        try {
            const rules = stylesheets[i].cssRules || [];
            for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                if (rule.style && rule.style.fontFamily) {
                    const fontSrc = rule.style.getPropertyValue('src');
                    if (fontSrc) {
                        const urlMatches = fontSrc.match(/url\((.*?)\)/g);
                        if (urlMatches) {
                            urlMatches.forEach(urlMatch => {
                                const url = urlMatch.replace(/url\(|\)|'|"/g, '');
                                fonts.add(url);
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.warn(`Could not access stylesheet: ${stylesheets[i].href}`, e);
        }
    }

    if (fonts.size > 0) {
        const win = window.open('', '', 'width=500,height=500');
        win.document.write('<h1>Fonts found on this page:</h1><ul id="font-list"></ul>');

        fonts.forEach(url => {
            const name = url.split('/').pop();
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = url;
            a.textContent = name;
            a.download = name;
            a.addEventListener('click', function(event) {
                event.preventDefault();
                downloadFont(url, name);
            });
            li.appendChild(a);
            win.document.body.appendChild(li);
        });

        win.document.write('<button id="download-all">Download All</button>');
        win.document.write('<button id="close-popup">Close</button>');
        
        win.document.getElementById('download-all').addEventListener('click', function() {
            fonts.forEach(url => {
                const name = url.split('/').pop();
                downloadFont(url, name);
            });
        });
        
        win.document.getElementById('close-popup').addEventListener('click', function() {
            win.close();
        });
    } else {
        alert('No fonts found on this page.');
    }
})();
