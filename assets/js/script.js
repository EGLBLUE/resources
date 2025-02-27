
const CONTENTS_PATH = './assets/contents';
const CONTENTS_ELEMENT = document.querySelector('.card1 .card-contents')
const DISCLAIMER_SUMMARY = new WeakMap();

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
    let agreeCheckbox = document.getElementById('agreeCheckbox');
    if (!agreeCheckbox){
        const result = await makeConfirmCheckbox();
        if (!result){
            return
        }
        agreeCheckbox = document.getElementById('agreeCheckbox');
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

function switchBtnDelay(button, delay) {
    button.disabled = true;
    setTimeout(() => {
        button.disabled = false;
    }, delay);
}

function resetRotate(card, delay){
    setTimeout(() => {
        card.style.transform = 'rotateY(-90deg)';
    }, delay);
}

function showCard1(card1Rotate, card2Rotate, transitionDelay, delay){
    const card2 = document.querySelector('.card2');
    const card1 = document.querySelector('.card1');
    const readMoreBtn = document.querySelector('.readmore-btn');
    const okBtn = document.querySelector('.ok-btn');

    okBtn.classList.add('hide-btn-switch');
    readMoreBtn.classList.remove('hide-btn-switch');
    card1.style.transitionDelay = transitionDelay;
    card1.classList.remove('hide-card');
    card1.style.transform = card1Rotate;
    
    card2.classList.add('hide-card');
    card2.style.transitionDelay = '0s';
    card2.style.transform = card2Rotate;

    resetRotate(card2, delay);
    switchBtnDelay(readMoreBtn, 600);
}

function showCard2(card1Rotate, card2Rotate, transitionDelay, delay){
    const card2 = document.querySelector('.card2');
    const card1 = document.querySelector('.card1');
    const readMoreBtn = document.querySelector('.readmore-btn');
    const okBtn = document.querySelector('.ok-btn');

    card2.classList.remove('hide-card');
    readMoreBtn.classList.add('hide-btn-switch');
    okBtn.classList.remove('hide-btn-switch');
    card2.style.transform = card2Rotate;
    card2.style.transitionDelay = transitionDelay;

    card1.style.transitionDelay = '0s';
    card1.classList.add('hide-card');
    card1.style.transform = card1Rotate;

    resetRotate(card1, delay);
    switchBtnDelay(okBtn, 600);
}

function initSwitchCard(){
    const card2 = document.querySelector('.card2');
    const readMoreBtn = document.querySelector('.readmore-btn');
    const okBtn = document.querySelector('.ok-btn');

    const disclaimerContent = document.createElement('p');
    disclaimerContent.className = "disclaimer-content";
    card2.appendChild(disclaimerContent);
    
    card2.style.transform = 'rotateY(-90deg)';

    let card2Rotate = 'rotateY(0deg)';
    let card1Rotate = 'rotateY(90deg)';
    const transitionDelay = '0.1s';
    const delay = 300;

    okBtn.onclick = () => {
        showCard1(card1Rotate, card2Rotate, transitionDelay, delay);
        card2Rotate = 'rotateY(0deg)';
        card1Rotate = 'rotateY(90deg)';
        const text = DISCLAIMER_SUMMARY.get(window);
        typeWriter(document.querySelector('.card1 .disclaimer'), text);
    }

    readMoreBtn.onclick = () => {
        showCard2(card1Rotate, card2Rotate, transitionDelay, delay);
        card2Rotate = 'rotateY(90deg)';
        card1Rotate = 'rotateY(0deg)';
        clearWritter(document.querySelector('.disclaimer-summary'));
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
        const disclaimer = document.querySelector('.card1 .disclaimer');
        const data = await response.text();

        typeWriter(disclaimer, data)
        DISCLAIMER_SUMMARY.set(window, data)
        return true;
    } catch (error) {
        console.error('Error fetching disclaimer summary:', error);
        return p;
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
                label.classList.add('checked');
            } else {
                removeDataLinks();
                label.classList.remove('checked');
            }
        });
        return true;
    }
}

function getLogo(){
    const img = new Image();
    img.src = "/assets/images/monogram-logo.webp"
    img.onload = () => {
        document.querySelector('.eagleblue-logo').src = img.src;
    }
}

function clearWritter(element){
    setTimeout(() => {
        element.remove();
    }, 400);
}

function typeWriter(element, text) {
    const typingText = document.createElement('div');
    typingText.className = "disclaimer-summary";
    element.append(typingText);
    
    let i = 0;
    let c = 0;
    let duration = 5;
    let newline = false;
    let span;
    let char;
    function write() {
        if (i < text.length) {
            char = text[i]
            if (newline){
                newline = false
                span = document.createElement('div');
            }else{
                if (char === ' '){
                    span = document.createElement('span');
                }
                else if (char === '.'){
                    span = document.createElement('p');
                    newline = true;
                }
                else{
                    span = document.createElement('p');
                }
            }
            span.textContent += char;
            typingText.appendChild(span);
            i++;
            if (c<duration){
                c++;
            }
            setTimeout(write, c);
        }
    }
    write();
}

function loadContents(){
    getLogo();
    initSwitchCard();
    try {
        fetchDataLinks();
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

window.onload = function() {
    loadContents();
};
