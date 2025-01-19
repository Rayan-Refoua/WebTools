// ==UserScript==
// @name         Hanasab admin panel tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Lots of fix/features for hanasab admin page
// @author       Your Name
// @match        https://panel.drhanasabzadeh.ir/*
// @icon            https://panel.drhanasabzadeh.ir/images/apps/T9d3d31729765570.png
// @grant        none
// ==/UserScript==
(function() {

'use strict';

// Select the input element by name
var mobileInput = document.querySelector('input[name="mobile"]');

// Check if the input element exists
if (mobileInput) {
    // Set the direction to LTR
    mobileInput.style.direction = 'ltr';
    mobileInput.style.fontFamily = "'Roboto Mono', monospace";
    mobileInput.style.fontSize = '20px';
    // Add an event listener for the input event
    mobileInput.addEventListener('input', checkAndConvertInputValue);

}


// Function to convert Persian/Arabic/Hindi digits to English digits
function convertToEnglishDigits(value) {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
    const hindiDigits = "०१२३४५६७८९";
    let englishValue = "";

    for (let char of value) {
        if (persianDigits.indexOf(char) !== -1) {
            englishValue += persianDigits.indexOf(char);
        } else if (arabicDigits.indexOf(char) !== -1) {
            englishValue += arabicDigits.indexOf(char);
        } else if (hindiDigits.indexOf(char) !== -1) {
            englishValue += hindiDigits.indexOf(char);
        } else {
            englishValue += char;
        }
    }

    return englishValue.replace(/\s/g, ''); // Remove any spaces
}

// Function to check and update the input value
function checkAndConvertInputValue() {
    const inputElement = document.querySelector('input[name="mobile"]');
    if (inputElement) {
        const currentValue = inputElement.value;
        const newValue = convertToEnglishDigits(currentValue);
        if (currentValue !== newValue) {
            inputElement.value = newValue;
        }
    }
}


// Wait until the DOM is fully loaded
window.addEventListener('load', function () {
    // Find all elements with an onclick attribute containing window.open
    var elements = document.querySelectorAll('[onclick*="window.open"]');
    elements.forEach(function (element) {
        // Extract the URL from the onclick attribute
        var onclickAttr = element.getAttribute('onclick');
        var urlMatch = onclickAttr.match(/window\.open\('([^']+)'/);
        if (urlMatch && urlMatch[1]) {
            var url = urlMatch[1];

            // Create a new hyperlink element
            var hyperlink = document.createElement('a');
            hyperlink.href = url;
            hyperlink.className = element.className; // Copy the classes
            hyperlink.innerHTML = element.innerHTML; // Copy the inner content

            // Replace the original element with the hyperlink
            element.parentNode.replaceChild(hyperlink, element);
        }
    });
}, false);

// Function to add the class "menu-item-open" to elements if not already present
function addMenuItemOpenClass() {
    var elements = document.querySelectorAll('.menu-item.menu-item-submenu');
    elements.forEach(function (element) {
        if (!element.classList.contains('menu-item-open')) {
            element.classList.add('menu-item-open');
        }
    });
}

// Add the class to all matching elements when the page loads
window.addEventListener('load', addMenuItemOpenClass, false);



// Function to create the dialog box
function createAutoCreateDialog() {
    const dialog = document.createElement('div');
    dialog.id = 'courseDialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '50px';
    dialog.style.left = '50px';
    dialog.style.width = '300px';
    dialog.style.padding = '10px';
    dialog.style.border = '1px solid #ccc';
    dialog.style.backgroundColor = '#fff';
    dialog.style.zIndex = '10000';
    dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';

    dialog.innerHTML = `
    <div style="cursor: move; background-color: #f0f0f0; padding: 5px; border-bottom: 1px solid #ccc;">
        <span>Course Submission</span>
        <button id="hideDialog" style="float: right;">Hide</button>
    </div>
    <form id="courseForm">
        <label for="courseref">Course Reference (ID):</label>
        <input type="text" id="courseref" name="courseref" required>

        <label for="_token">Token:</label>
        <input type="text" id="_token" name="_token" required>

        <label for="name_l70">Names (one per line):</label>
        <textarea id="name_l70" name="name_l70" rows="5" required></textarea>

        <button type="button" id="submitButton">Submit</button>

        <label for="debug">Debug Information:</label>
        <textarea id="debug" name="debug" rows="5" readonly style="width: 100%;"></textarea>
    </form>
`;

    document.body.appendChild(dialog);

    // Make the dialog movable
    makeMovable_createAutoCreateDialog(dialog);

    // Hide button functionality
    document.getElementById('hideDialog').onclick = function () {
        dialog.style.display = 'none';
    };

    // Auto-fill the token and course reference
    document.getElementById('_token').value = document.querySelector('input[name="_token"]').value;
    const urlParams = new URLSearchParams(window.location.search);
    const courseref = urlParams.get('courseref');
    if (courseref) {
        document.getElementById('courseref').value = courseref;
    }

    // Submit button functionality
    document.getElementById('submitButton').onclick = function () {
        submitData_to_load_courceID();
    };
}

// Function to make the dialog movable
function makeMovable_createAutoCreateDialog(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.firstElementChild;
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function submitData_to_load_courceID() {
    const form = document.getElementById('courseForm');
    const courseref = form.courseref.value;
    const token = form._token.value;
    const names = form.name_l70.value.split('\n');
    const url = 'https://panel.drhanasabzadeh.ir/admin/meet/store';
    const debugElement = document.getElementById('debug');
    debugElement.value = ''; // Clear previous debug info

    names.forEach((name, index) => {
        const data = new URLSearchParams({
            _token: token,
            courseref: courseref,
            name_l70: name.trim(),
            type: 2,
            price: '',
            priceoff: '',
            active: 1,
            hour_delay: '',
            langs_id: 70
        });

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        })
            .then(response => {
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (error) {
                        return text;
                    }
                });
            })
            .then(result => {
                const debugMessage = `Response for ${name.trim()}:\n${JSON.stringify(result, null, 2)}\n\n`;
                debugElement.value += debugMessage;
            })
            .catch(error => {
                const debugMessage = `Error for ${name.trim()}:\n${error}\n\n`;
                debugElement.value += debugMessage;
            });
    });
}


// Check if the current page URL starts with the specified string
if (window.location.href.startsWith('https://panel.drhanasabzadeh.ir/admin/meet/create')) {
    // Create and show the dialog box when the script runs
    createAutoCreateDialog();
}


// Function to create labels and submit form
function createLabelsAndSubmitForm() {
    // Add custom CSS to the page
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
            .lbmrg {
                margin: 3px;
            }
        `;
    document.head.appendChild(style);

    // Find the select element by its id
    const selectElement = document.getElementById('courseref');
    if (selectElement) {
        // Find the container with the class 'form-group row'
        const container = selectElement.closest('.form-group.row');
        if (container) {
            // Create a new div element
            const newDiv = document.createElement('div');
            newDiv.style.marginTop = '10px';

            // Find the submit button
            const submitButton = document.querySelector('button[type="submit"].btn.btn-primary');

            // Iterate over each option in the select element
            Array.from(selectElement.options).forEach(option => {
                // Create a new label element for each option
                const label = document.createElement('label');
                label.textContent = option.text;
                label.className = 'label label-primary label-inline lbmrg';

                // Add click event listener to each label
                label.addEventListener('click', () => {
                    selectElement.value = option.value;
                    // Trigger change event on select element
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);

                    // Submit the form
                    if (submitButton) {
                        submitButton.click();
                    }
                });

                // Append label to the new div
                newDiv.appendChild(label);
            });

            // Insert the new div after the container element
            container.appendChild(newDiv);
        }
    }
}

// Check if the URL matches the specified pattern
if (window.location.href.startsWith('https://panel.drhanasabzadeh.ir/admin/meet')) {
    createLabelsAndSubmitForm();
}

    'use strict';

    // Select all div elements with the "wave" class
    var waveDivs = document.querySelectorAll('div.wave');

    // Remove the "wave" class from each div
    waveDivs.forEach(function(div) {
        div.classList.remove('wave');
    });


    // Function to click the header and check the class
    function clickAndCheck() {
        const header = document.querySelector('th.sorting_asc[aria-controls="kt_datatable"]');
        if (header) {
            header.click();
            setTimeout(() => {
                if (header.classList.contains('sorting_desc')) {
                    console.log('Class changed to sorting_desc');
                } else {
                    console.log('Class not changed, trying again...');
                    clickAndCheck();
                }
            }, 300);
        } else {
            console.log('Header not found');
        }
    }

    function setSelectOption() {
        const select = document.querySelector('select[name="kt_datatable_length"][aria-controls="kt_datatable"]');
        if (select) {
            let optionExists = false;

            // Check if the option for 1000 exists
            Array.from(select.options).forEach(option => {
                if (option.value === '1000') {
                    optionExists = true;
                    select.value = '1000';
                }
            });

            // If the option does not exist, create it
            if (!optionExists) {
                const newOption = new Option('1000', '1000');
                select.add(newOption);
                select.value = '1000';
            }

            // Trigger the change event
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);

            console.log('Select option set to 1000 and change event triggered');
        } else {
            console.log('Select element not found, retrying...');
            setTimeout(setSelectOption, 1000);
        }
    }

    // Start the process
    clickAndCheck();

    // Start checking for the select element
    setSelectOption();

})();
