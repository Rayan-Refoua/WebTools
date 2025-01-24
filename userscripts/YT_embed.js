// ==UserScript==
// @name         YouTube Embed Loader with Time
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Adds a button to load the current YouTube video as an embed with the current time parameter.
// @author       Your Name
// @match        *://*.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to convert time string (MM:SS) to seconds
    function timeToSeconds(time) {
        const [minutes, seconds] = time.split(':').map(Number);
        return minutes * 60 + seconds;
    }

    // Create the button
    var button = document.createElement('button');
    button.innerText = 'Load as Embed';
    button.style.padding = '5px 10px';
    button.style.margin = '5px';
    button.style.backgroundColor = 'rgb(255 255 255 / 10%)';
    button.style.color = '#ffffff';
    button.style.fontSize = '16px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';

    // Add click event to the button
    button.addEventListener('click', function() {
        const currentTimeElement = document.querySelector('.ytp-time-current');
        let timeParam = '';
        if (currentTimeElement) {
            const currentTime = currentTimeElement.innerText;
            const seconds = timeToSeconds(currentTime);
            timeParam = `?start=${seconds}`;
        }

        const url = new URL(window.location.href);
        const videoId = url.searchParams.get('v');
        const embedUrl = `https://www.youtube.com/embed/${videoId}${timeParam}`;
        window.location.href = embedUrl;
    });

    // Append the button under the element with class "ytp-next-button ytp-button"
    const targetElement = document.querySelector('.ytp-next-button.ytp-button');
    if (targetElement) {
        targetElement.parentNode.insertBefore(button, targetElement.nextSibling);
    }
})();
