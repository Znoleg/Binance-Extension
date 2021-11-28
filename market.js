const labelClasses = "css-sjmqpn";
const firstBtnClasses = "css-1qckmgm";
const plusBtnClasses = "css-nphwqx";
const maxBtnClasses = "css-1rqdfgy";
const secondBtnClasses = "css-d8znws";
const timerClasses = "css-db296b";
let container;

const html = `
<body>
<p id="label" style="text-align: center; font-size: 1em;"></p>
    <div class="inline-container" style="margin: 5px 0 0 0; display: flex; justify-content: center; align-items: center; width: 240px;">
        <div>
            <span id="quan-span" style="font-size: 1.25em;">Quantity:</span> 

            <div class="inline-container" style="margin: 5px -10px 10px 0; display: flex; justify-content: center; align-items: center; width: 240px;">
                <button class="quantity-button" style="border: none; width: 40px; height: 40px; cursor: pointer; opacity: 1; border-radius: 32px; background: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 99.77%); justify-content: center; align-items: center;">➖</button>
                <input id="buy-quantity" style="margin: 10px; width: 35%;" type="number" name="quantity" value="1" min="1" disabled>
                <button class="quantity-button" style="border: none; width: 40px; height: 40px; cursor: pointer; opacity: 1; border-radius: 32px; background: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 99.77%); justify-content: center; align-items: center;">➕</button>
                <input type="checkbox" name="max" id="max" style="margin-left: 10px;"><label for="max"><span id="maxspan" style="font-weight: 600; color: rgb(201, 148, 0); text-decoration: underline; cursor: pointer; font-size: 1em;">Max</span></label>
            </div>
        </div>
    </div>
    <div id="setting-block">
        Button press delay: <input id="press-delay" type="range" min="5" max="75" value="45"><span id="press-delay-hint" style="font-size: 0.75em;"></span>
        <p></p>
        Button scan delay: <input id="scan-delay" type="range" min="5" max="30" value="20"><span id="scan-delay-hint" style="font-size: 0.75em;"></span>
        <p></p>
        <input type="checkbox" name="refresh-input" id="refresh-input"><label for="refresh-input">Delayed purchase</label>
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

async function sureButtonPress(button, ms = 10) {
    let pressFlag = false;
    button.addEventListener('click', function () {
        pressFlag = true;
        console.log("click");
    });
    while (pressFlag == false) {
        console.log("trying click");
        button.click();
        await sleep(ms);
    }
}

let buyXPath, maxXPath, plusXPath, confirmXPath;
let retries = 0;
async function buy(buyButton, pressDelay = 0, scanDelay = 0) {
    try {
        console.log("buying");
        await sureButtonPress(buyButton, 5);
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

let quantitySpan;
let minusBtn, plusBtn;
let quantityInput;
let msgSpan;

let quantityValue, quantityMin = null, quantityMax = null;
let isMax = false;

let pressDelayInput, scanDelayInput;
let minPressDelay, maxPressDelay, minScanDelay, maxScanDelay, currentPressDelay, currentScanDelay; //delays
let maxBtn;
let buyButton;
let buyPressed = false;

/* Visual functions */

function changeQuantityOpacity(isChecked) {
    const offOpacity = 0.3;
    const onOpacity = 1;
    minusBtn.disabled = isChecked;
    plusBtn.disabled = isChecked;
    
    let newOpacity;
    if (isChecked == true) {
        newOpacity = offOpacity;
    }
    else {
        newOpacity = onOpacity;
    }
    
    quantitySpan.style.opacity = newOpacity;
    minusBtn.style.opacity = newOpacity;
    plusBtn.style.opacity = newOpacity;
    quantityInput.style.opacity = newOpacity;
}

function changeQuantityInput(delta) {
    let temp = quantityValue + parseInt(delta);
    if (quantityMin != null) {
        if (temp < quantityMin) return;
    }
    if (quantityMax != null) {
        if (temp > quantityMax) return;
    }
    quantityValue = temp;
    quantityInput.value = parseInt(quantityValue);
}

function printWarning(msg) {
    container.style.bottom = '12%';
    container.style.height = '245px';
    msgSpan.style.color = 'red';
    msgSpan.innerHTML = msg;
}

function printGood(msg) {
    container.style.bottom = '5%';
    container.style.height = '215px';
    msgSpan.style.color = 'green';
    msgSpan.innerHTML = msg;
}

/* */

/* Refresh functionality */
let refreshInput;


function DisableDelayedPurchase() {
    refreshInput.disabled = true;
}

function setLocalData() {
    localStorage.setItem("isMax", isMax);
    localStorage.setItem("quantityValue", quantityValue);
    localStorage.setItem("pressDelay", pressDelayInput.value);
    localStorage.setItem("scanDelay", scanDelayInput.value);
    localStorage.setItem("buyPressed", buyPressed);
}

function clearLocalData() {
    localStorage.removeItem("isMax");
    localStorage.removeItem("quantityValue");
    localStorage.removeItem("pressDelay");
    localStorage.removeItem("scanDelay");
    localStorage.removeItem("buyPressed");
}

function trySetLocalData() {
    let isMax = localStorage.getItem("isMax");
    
    if (isMax != null) { // if localStorage exists
        if (isMax == "true") { 
            maxBtn.click();
        }
        else {
            quantityValue = parseInt(localStorage.getItem("quantityValue"));
            quantityInput.value = quantityValue;
        }

        pressDelayInput.value = parseInt(localStorage.getItem("pressDelay"));
        scanDelayInput.value = parseInt(localStorage.getItem("scanDelay"));
        let isPressed = localStorage.getItem("buyPressed");
        if (isPressed == true || isPressed == "true") {
            buyButton.click();
        }
        clearLocalData();
        return true;
    }
    return false;
}

function exitWithLocalData() {
    if (refreshInput != null && (refreshInput.checked == true || refreshInput.checked == "true")) {
        setLocalData();
        document.location.reload();
    }
}

const timeUrl = "https://api.binance.com/api/v3/time";
async function GetServerTime() {
    let response = await fetch(timeUrl);
    return ((await response.json()).serverTime);
}

const boxesInfoUrl = "https://www.binance.com/bapi/nft/v1/public/nft/mystery-box/list?page=1&size=5";
async function GetBoxesInfo() {
    try {
        let response = await fetch(boxesInfoUrl);
        let json = await response.json();
        let boxes = json.data;
        return boxes;
    }
    catch (e) {
        printWarning(e.stack);
    }
}

function GetBoxByID(boxes = [], prodId = "") {
    try {
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].productId == prodId) {
                return boxes[i];
            }
        }
        printWarning("Box " + prodId + " not found! Delayed purchase disabled.");
        DisableDelayedPurchase();
    }
    catch (e) {
        printWarning(e.stack);
    }
    
}

async function getBoxSaleTime(prodId = "") {
    let boxes = await GetBoxesInfo();
    let buyBox = GetBoxByID(boxes, prodId);
    console.log(buyBox);
    let buyTime = buyBox.startTime;
    return buyTime;
}

async function startRefreshWaiting(buyTime, stopBefore, callback = () => {}) {
    try {
        let currentTime = await GetServerTime();
        console.log("Current time: " + currentTime + '\n' + "Buy time: " + buyTime);

        let waitTime = buyTime - currentTime - stopBefore;
        if (waitTime < 0) return;

        console.log("Wait time: " + waitTime);
        await sleep(waitTime);
        
        callback();
    }
    catch (e) {
        printWarning(e.stack);
    }
}

async function waitForCondition(checkTime = 100, f = () => false) {
    let result = f();
    while (result == false) {
        console.log(result);
        await sleep(checkTime);
        result = f();
    }
    return;
}

/* */

/* INIT FUNCTIONS */

function createStartDiv() {
    container = document.createElement('div');
    container.style.backgroundColor = '#fafafa';
    container.style.width = '290px';
    container.style.height = '195px';
    container.style.position = 'fixed';
    container.style.bottom = '5%';
    container.style.left = '5%';
    container.style.outline = '3px solid rgb(240, 185,11)';
    container.innerHTML = html;
    document.body.appendChild(container);
}

function initXPaths() {
    const buyName = "Buy";
    const maxName = "Max";
    const plusName = "＋";
    const confirmName = "Confirm";

    buyXPath = createXPath("button", buyName, false);
    maxXPath = createXPath("div", maxName, true);
    plusXPath = createXPath("div", plusName, false);
    confirmXPath = createXPath("button", confirmName, false);
}

function getElements() {
    try {
        msgSpan = document.querySelector('#msg-span');
        label = document.querySelector('#label');
        quantitySpan = document.querySelector('#quan-span');
        let buttons = document.querySelectorAll('.quantity-button');
        minusBtn = buttons[0];
        plusBtn = buttons[1];

        quantityInput = document.querySelector('#buy-quantity');
        quantityValue = parseInt(quantityInput.getAttribute('value')); 

        if (quantityInput.hasAttribute('min')) {
            quantityMin = quantityInput.getAttribute('min');
        }
        if (quantityInput.hasAttribute('max')) {
            quantityMax = quantityInput.getAttribute('max');
        }

        maxBtn = document.querySelector('#max');
        refreshInput = document.querySelector('#refresh-input');
        buyButton = document.querySelector('#buy');

        pressDelayInput = document.querySelector('#press-delay');
        scanDelayInput = document.querySelector('#scan-delay');
        if (!pressDelayInput.hasAttribute('min') || !pressDelayInput.hasAttribute('max') || !pressDelayInput.hasAttribute('value')
        || !scanDelayInput.hasAttribute('min') || !scanDelayInput.hasAttribute('max') || !scanDelayInput.hasAttribute('value')) 
            throw "No ms inputs min-max-value";
        
        minPressDelay = parseInt(pressDelayInput.getAttribute('min'));
        maxPressDelay = parseInt(pressDelayInput.getAttribute('max'));
        minScanDelay = parseInt(scanDelayInput.getAttribute('min'));
        maxScanDelay = parseInt(scanDelayInput.getAttribute('max'));
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

function getProdID() {
    let paramsString = document.location.search;
    let params = new URLSearchParams(paramsString);
    let prodId = params.get("productId");
    return prodId;
}

/* */

let productId;
let boxSaleTime;
window.addEventListener('load', async function() {
    try {
        createStartDiv();
        getElements();
        initXPaths();
        turnOffStuff();
        checkENVersion();
        productId = getProdID();
        boxSaleTime = await getBoxSaleTime(productId);

        maxBtn.addEventListener('input', function(e) {
            isMax = this.checked;
            changeQuantityOpacity(isMax);
        });
        
        minusBtn.addEventListener('click', function() {
            changeQuantityInput(-1);
        });
        
        plusBtn.addEventListener('click', function() {
            changeQuantityInput(1);
        });
        
        buyButton.addEventListener('click', async function() {
            DoVisualStuff();
            let quantityVal;
            if (isMax == true) {
                quantityVal = "max";
            }
            else {
                quantityVal = quantityValue;
            }
            
            let aucBuyButton = await GetElementsRecursiveXPath(buyXPath, 10);
            console.log(aucBuyButton);
            
            console.log("Buy has started");
            printGood("Auto-buy has started! Waiting for sale.");
            
            console.log(currentPressDelay + " " + currentScanDelay);
            await waitForCondition(10, isBuyButtonEnabled);
            await buy(aucBuyButton, currentPressDelay, currentScanDelay);

            function isBuyButtonEnabled() {
                return !aucBuyButton.disabled;
            }

            function DoVisualStuff() {
                buyPressed = true;
                buyButton.disabled = true;
                plusBtn.disabled = true;
                minusBtn.disabled = true;
                currentPressDelay = parseInt(pressDelayInput.value);
                currentScanDelay = parseInt(scanDelayInput.value);
            }
        });

        document.querySelector('#press-delay-hint').innerHTML = minPressDelay + '-' + maxPressDelay + ' ms';
        document.querySelector('#scan-delay-hint').innerHTML = minScanDelay + '-' + maxScanDelay + ' ms';
    
        function turnOffStuff() {
            refreshInput.disabled = true;
            maxBtn.disabled = true;
            minusBtn.disabled = true;
            plusBtn.disabled = true;
        }

        if (trySetLocalData() == false) {
            startRefreshWaiting(boxSaleTime, 12);
        }
        else {
            refreshInput.remove();
        }
        
    } catch (e) {
        printWarning(e.stack);
    }
});