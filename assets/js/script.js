
const CONTENTS_PATH = '/assets/contents';
const CONTENTS_ELEMENT = document.querySelector('.contents .card .card-contents')

function showData(name, data){
    const container = document.querySelector('.link-containers');
    const title = document.createElement('h5');

    title.className = "link-title";
    title.textContent = name;
    container.appendChild(title);

    const linkList = document.createElement('ul');
    linkList.className = "link-list";
    container.appendChild(linkList);

    data.forEach(folder => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = folder.url;
        link.textContent = `${folder.name}`;
        listItem.appendChild(link);
        linkList.appendChild(listItem);
    });
    
}

function initLinkContainer(){
    const contents = CONTENTS_ELEMENT
    const linkContainer = document.createElement('div');
    linkContainer.className = "link-containers";
    contents.appendChild(linkContainer);
}

async function fetchDataLinks(){
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    if (!agreeCheckbox){
        const result = await makeConfirmCheckbox();
        if (!result){
            return
        }
    }
    if (!agreeCheckbox.checked){
        return
    }
    fetch('assets/storages.json')
    .then(response => response.json())
    .then(data => {
        initLinkContainer();
        Object.entries(data).forEach(([key, value]) => {
            showData(key, value);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        return [];
    });
}

function removeDataLinks(){
    const linkContainer = document.querySelector('.link-containers');
    linkContainer.remove();
}

function disclaimerOverlayContent(){
    const disclaimerBtn = document.querySelector('.contents .disclaimer .disclaimer-btn');
    const disclaimerOverlay = document.querySelector('.disclaimer-overlay');
    const disclaimerContainer = document.querySelector('.disclaimer-overlay .disclaimer-container');
    const closeDisclaimerBtn = document.querySelector('.disclaimer-overlay .close-btn');
    
    const disclaimerContent = document.createElement('p');
    disclaimerContent.className = "disclaimer-content";
    disclaimerContainer.appendChild(disclaimerContent);

    disclaimerBtn.onclick = () => {
        disclaimerOverlay.classList.toggle('active');
        
        if (disclaimerOverlay.classList.contains('active')) {
            document.addEventListener('keydown', closeOnEscape);
        } else {
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    closeDisclaimerBtn.onclick = () => {
        disclaimerOverlay.classList.remove('active');
    };

    function closeOnEscape(event) {
        if (event.key === 'Escape') {
            disclaimerOverlay.classList.remove('active');
            document.removeEventListener('keydown', closeOnEscape);
        }
    }
}

async function fetchDisclaimerContent() {
    const disclaimerContent = document.querySelector('.disclaimer-content');
    try {
        const response = await fetch(`${CONTENTS_PATH}/disclaimer.txt`);
        if (!response.ok) {
            throw new Error('File not found');
        }
        const data = await response.text();
        disclaimerContent.textContent = data;
        return true;
    } catch (error) {
        console.error('Error fetching disclaimer content:', error);
        disclaimerContent.textContent = "Error, please try again later.";
        return false;
    }
}

async function fetchDisclaimerSummary() {
    try {
        const response = await fetch(`${CONTENTS_PATH}/disclaimer-summary.txt`);
        if (!response.ok) {
            throw new Error('File not found');
        }
        const disclaimer = document.querySelector('.contents .card .card-contents .disclaimer');
        const data = await response.text();
        const disclaimerSummary = document.createElement('p');

        disclaimerSummary.className = "disclaimer-summary";
        disclaimerSummary.textContent = data;
        disclaimer.insertBefore(disclaimerSummary, document.querySelector('.disclaimer-btn'));
        return true;
    } catch (error) {
        console.error('Error fetching disclaimer summary:', error);
        return false;
    }
}

async function makeConfirmCheckbox() {
    const [contentSuccess, summarySuccess] = await Promise.all([
        fetchDisclaimerContent(),
        fetchDisclaimerSummary()
    ]);

    if (contentSuccess || summarySuccess) {
        const label = document.createElement('label');
        label.className = "confirm-label";
        const agreeCheckbox = document.createElement('input');
        agreeCheckbox.type = "checkbox";
        agreeCheckbox.id = "agreeCheckbox";
        label.appendChild(agreeCheckbox);
        const p = document.createElement('p');
        p.textContent = "You must agree to our Disclaimer before accessing any files on this website.";
        label.appendChild(p);
        CONTENTS_ELEMENT.appendChild(label);
        
        agreeCheckbox.addEventListener("change", function () {
            if (this.checked) {
                fetchDataLinks();
            } else {
                removeDataLinks();
            }
        });
        return true;
    }
}

function loadContents(){
    disclaimerOverlayContent();

    try {
        fetchDataLinks();
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

window.onload = function() {
    loadContents();
};
