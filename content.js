let picInPicIcon = `<svg version="1.1" id="Warstwa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">.st0 {fill:#FFFFFFab;}.st0:hover{fill:#ffffff;}</style><g><title>Picture In Picture</title><g id="XMLID_6_"><path id="XMLID_11_" class="st0" d="M19.6,11.2h-8.9v6.4h8.8L19.6,11.2L19.6,11.2z M23.9,19.8v-15c0-1.2-1-2.1-2.2-2.1H1.9c-1.2,0-2.2,0.9-2.2,2.1v15c0,1.2,1,2.1,2.2,2.1h19.9C22.9,21.9,23.9,21,23.9,19.8z M21.7,19.8H1.9v-15h19.9V19.8z"/></g></g></svg>`
let htmlAutoSkipOff = ` <div id="toggle-skip" class="toggle-container-skip"> <svg class="toggle-circle-skip" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <circle cx="12" cy="12" r="10" fill="#ccc" class="circle-off" /> </svg> <div class="tooltip">Ativa ou desativa o Auto Skip</div> </div>`;
let htmlAutoSkipActive = ` <div id="toggle-skip" class="toggle-container-skip"> <svg class="toggle-circle-skip" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <circle cx="12" cy="12" r="10" fill="#4caf50" class="circle-off" /> </svg> <div class="tooltip">Ativa ou desativa o Auto Skip</div> </div>`;
const MAX_TRIES_MONITOR_SKIP = 10;
let isMonitorActive = false;
let isIconActive = false;
let isSpeedButtonActive = false; 
let autoSkipInterval; 

function initContent() {
    startMonitoringForVideo(0);
}

interceptarRespostasPlay();
initContent();

function eraseIcon() {
    let modals = document.querySelectorAll('.ontop');
    if (modals.length > 0) {
        modals.forEach(modal => {
           modal.remove(); 
        });
    }
}

function createIcon() {
    let modal = document.createElement('div');
    const createSmallPopup = () => {
        if (document.querySelector('[data-testid="vilos-fullscreen_button"]')) {
            const iconFrame = document.querySelector('[data-testid="vilos-fullscreen_button"]').parentElement.parentElement;
            modal.innerHTML = `<div>${picInPicIcon}</div>`;
            modal.classList.add('ontop');
            modal.children[0].classList.add('btn-inner-pip'); 

            if (iconFrame) {
                iconFrame.insertBefore(modal, iconFrame.children[0]);
            }
        }
    };
    createSmallPopup();

    modal.addEventListener('click', e => {
        e.stopImmediatePropagation();
        let video = document.querySelector('video');
        if (video.attributes.disablepictureinpicture) {
            video.removeAttribute('disablepictureinpicture');
        }
        if ('pictureInPictureEnabled' in document) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture().catch(err => {
                    console.log(err);
                });
                return;
            }
            video.requestPictureInPicture().catch(err => {
                console.log(err);
            });
        }
    });
}

function createIconAutoSkip() {
    let skipButton = document.createElement('div');
    if (localStorage.getItem('crunchyroll_auto_skip') == 1){
        skipButton.innerHTML = htmlAutoSkipActive;
        setAutoSkip();
    } else {
        skipButton.innerHTML = htmlAutoSkipOff;
    }
    skipButton.classList.add('ontop-skip');

    const createSmallPopup = () => {
        const fullscreenButton = document.querySelector('[data-testid="vilos-fullscreen_button"]');
        if (fullscreenButton) {
            const iconFrame = fullscreenButton.parentElement.parentElement;
            if (iconFrame) {
                iconFrame.insertBefore(skipButton, iconFrame.children[0]);
            }
        }
    };

    createSmallPopup();

    // Adiciona o evento de clique e aplica o estado inicial
    document.getElementById('toggle-skip').addEventListener('click', toggleActiveClass);
}

function createSpeedButton() {
    let speedButton = document.createElement('div');
    const createSmallPopup = () => {
        if (document.querySelector('[data-testid="vilos-fullscreen_button"]')) {
            const iconFrame = document.querySelector('[data-testid="vilos-fullscreen_button"]').parentElement.parentElement;
            let video = document.querySelector('video');
            let currentSpeed = video ? video.playbackRate : 1;
            speedButton.innerHTML = `<div>${currentSpeed}X</div>`;
            speedButton.classList.add('ontop');
            speedButton.children[0].classList.add('btn-inner-speed'); 

            if (iconFrame) {
                iconFrame.insertBefore(speedButton, iconFrame.children[0]);
            }
        }
    };
    createSmallPopup();

    speedButton.addEventListener('click', e => {
        e.stopImmediatePropagation();
        showSpeedMenu(speedButton);
    });

    let video = document.querySelector('video');
    if (video) {
        video.addEventListener('ratechange', () => {
            speedButton.children[0].innerText = `${video.playbackRate}X`;
        });
    }

    createIconAutoSkip();
}

function showSpeedMenu(parentElement) {
    let menu = document.createElement('div');
    menu.classList.add('speed-menu');
    let speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];
    speeds.forEach(speed => {
        let option = document.createElement('div');
        option.innerText = `${speed}X`;
        option.classList.add('speed-option');
        option.addEventListener('click', () => {
            let video = document.querySelector('video');
            if (video) {
                video.playbackRate = speed;
            }
            menu.remove();
        });
        menu.appendChild(option);
    });
    document.body.appendChild(menu);
    // Posicionar o menu próximo ao botão
    let rect = parentElement.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.top - menu.offsetHeight}px`;
    document.addEventListener('click', function onClickOutside(event) {
        if (!menu.contains(event.target) && event.target !== parentElement) {
            menu.remove();
            document.removeEventListener('click', onClickOutside);
        }
    });
}

function startMonitoringForVideo(numTries) {
    numTries++;
    const monitor = new MutationObserver(() => {
        let video = document.querySelector("video");
        let frame = document.querySelector('[data-testid="vilos-fullscreen_button"]');
        let pipIcon = document.querySelector('.ontop');
        if (video && !pipIcon) {
            isIconActive = false;
            isSpeedButtonActive = false;
        }
        if (video && frame && isIconActive == false) {
            createIcon();
            isIconActive = true;
        } 
        if (video && frame && isSpeedButtonActive == false) {
            createSpeedButton();
            isSpeedButtonActive = true;
        }
    });

    let reactEntry = document.querySelector("body");
    if (reactEntry) {
        if (isMonitorActive == false) {
            monitor.observe(reactEntry, {
                attributes: false,
                childList: true,
                subtree: true
            });
            isMonitorActive = true;
        } else {
            return;
        }

    } else {
        if (numTries > MAX_TRIES_MONITOR_SKIP) { return; }
        setTimeout(() => {
            startMonitoringForVideo(numTries);
        }, 100 * numTries);
    }
}

function interceptarRespostasPlay() {
    let slug = document.location.pathname;

    if (slug.includes('pt-br')) {
        const regex = /\/watch\/([^\/]+)/;

        const resultado = slug.match(regex);

        if (resultado && resultado[1]) {
            console.log(resultado[1]);
        } else {
            return null;
        }
    }
}

function checkDivSkip() {
    const divPularAbertura = document.querySelector('div[data-testid="skipIntroText"]');

    if (divPularAbertura) {
        setTimeout(() => {    
            divPularAbertura.click();
        }, 1000);
    }
}

function setAutoSkip() {
    const status = localStorage.getItem('crunchyroll_auto_skip');

    if (status !== null) {
        if (status == 1) {
            if (! autoSkipInterval) { 
                autoSkipInterval = setInterval(() => {
                    checkDivSkip();
                }, 1000);
            }
        } else {
            if (autoSkipInterval) {
                clearInterval(autoSkipInterval);
                autoSkipInterval = null;
            }
        }
    } else {
        localStorage.setItem('crunchyroll_auto_skip', 0);
    }
}

function toggleActiveClass() {
    const status = localStorage.getItem('crunchyroll_auto_skip');
    const circle = document.querySelector('.toggle-circle-skip circle');

    if (status === '1') {
        localStorage.setItem('crunchyroll_auto_skip', '0');
        circle.setAttribute('fill', '#ccc');
    } else {
        localStorage.setItem('crunchyroll_auto_skip', '1');
        circle.setAttribute('fill', '#4caf50');
    }

    setAutoSkip();
}