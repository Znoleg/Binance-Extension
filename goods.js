let container;

const html = `
<body>
<p id="label" style="text-align: center; font-size: 1em;"></p>
    <div class="inline-container" style="margin: 5px 0 0 0; display: flex; justify-content: center; align-items: center; width: 240px;">
    </div>
    <button id="buy" style="display: block; margin: 10px auto 0 auto; cursor: pointer; font-family: inherit; text-align: center; font-weight: 700; border: none; background-image: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 100%); height: 30px; width: 140px; font-size: 1em;">Start auto buy</button>
    <span id="msg-span" style="display:block; margin: 5px auto 0 auto; text-align: center; font-size: 0.8em"></span>
</body>
`;

async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));    
}

async function GetElementsRecursive(classes, ms) {
    try {
        let item = document.getElementsByClassName(classes);
        while (item == null || item.length == 0) {
            await sleep(ms);
            item = document.getElementsByClassName(classes);
        }
        return item;
    }
    catch (e) {
        printWarning(e.stack);
    }
}
    
async function GetSingleElementRecursive(classes, ms, index) {
    return ((await GetElementsRecursive(classes, ms))[index]);
}

/* XPATH FUNCTIONS */

function createXPath(elem, innerText, contains) {
    let xpath;
    if (contains) {
        xpath = "//" + elem + "[contains(text(),'" + innerText + "')]";
    }
    else {
        xpath = "//" + elem + "[text()='" + innerText + "']";
    }
    return xpath;
}

async function GetElementsRecursiveXPath(xpath, ms) {
    try {
        let item = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        while (item == null || item.length == 0) {
            await sleep(ms);
            item = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }
        return item;
    }
    catch (e) {
        printWarning(e.stack);
    }
}

async function GetSingleElementRecursiveXPath(xpath, ms, index) {
    return ((await GetElementsRecursiveXPath(xpath, ms))[index]);
}

/* */

let buyXPath, confirmXPath;
let retries = 0;
async function buy(pressDelay, scanDelay) {
    try {
        console.log("Buy has started");
        printGood("Auto-buy has started! Waiting for sale.");

        let buyButton = await GetElementsRecursiveXPath(buyXPath, scanDelay);
        buyButton.click();
        console.log(buyButton);
        await sleep(pressDelay);
        
        let confirmButton = await GetElementsRecursiveXPath(confirmXPath, scanDelay);
        while (confirmButton == null) {
            confirmButton = await GetElementsRecursiveXPath(confirmXPath, 10);
        }
        
        const confirmClickDelay = 30;
        for (let i = 0; i < 150; i++) {
            confirmButton.click();
            await sleep(confirmClickDelay);
        }
    }
    catch (e) {
        if (retries == 4) {
            return;
        }
        printWarning(e.stack);
        retries++;
        buy(quantity);
    }
}

let msgSpan;
let buyButton;

/* Visual functions */

function changeQuantityOpacity(isChecked) {

}

function changeQuantityInput(delta) {

}

function printWarning(msg) {
    container.style.bottom = '12%';
    container.style.height = '100px';
    msgSpan.style.color = 'red';
    msgSpan.innerHTML = msg;
}

function printGood(msg) {
    container.style.bottom = '5%';
    container.style.height = '100px';
    msgSpan.style.color = 'green';
    msgSpan.innerHTML = msg;
}

/* */

/* Refresh functionality */

const timeUrl = "https://api.binance.com/api/v3/time";
async function GetServerTime() {
    let response = await fetch(timeUrl);
    return ((await response.json()).serverTime);
}

/* */

/* INIT FUNCTIONS */

function createStartDiv() {
    container = document.createElement('div');
    container.style.backgroundColor = '#fafafa';
    container.style.width = '290px';
    container.style.height = '60px';
    container.style.position = 'fixed';
    container.style.bottom = '5%';
    container.style.left = '5%';
    container.style.outline = '3px solid rgb(240, 185,11)';
    container.innerHTML = html;
    document.body.appendChild(container);
}

function initXPaths() {
    const buyName = "Buy Now";
    const confirmName = "Confirm";

    buyXPath = createXPath("button", buyName, false);
    confirmXPath = createXPath("button", confirmName, false);
}

function getElements() {
    try {
        msgSpan = document.querySelector('#msg-span');
        buyButton = document.querySelector('#buy');
    }
    catch (e){
        printWarning("Something wrong on extension start.\n Try refresh a page\n" + e.stack);
    }
}

function checkENVersion() {
    let url = document.location.href;
    if (url.includes("/en/") == false) {
        printWarning("Bot works only on English version! Please switch Binance page to English");
        buyButton.remove();
    }
}

/* */

window.addEventListener('load', async function() {
    try {
        createStartDiv();
        getElements();
        initXPaths();
        
        buyButton.addEventListener('click', function() {
            buyButton.disabled = true;
            
            const pressDelay = 20;
            const scanDelay = 15;
            buy(pressDelay, scanDelay);
        });
    
        checkENVersion();
        
    } catch (e) {
        printWarning(e.stack);
    }
});