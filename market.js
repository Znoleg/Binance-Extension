const labelClasses = "css-sjmqpn";
const firstBtnClasses = "css-1qckmgm";
const plusBtnClasses = "css-nphwqx";
const maxBtnClasses = "css-1rqdfgy";
const secondBtnClasses = "css-d8znws";
const timerClasses = "css-1gfblx5";
let container;

const html = `
<body>
<p id="label" style="text-align: center; font-size: 1em;"></p>
    <div class="inline-container" style="margin: 5px 0 0 0; display: flex; justify-content: center; align-items: center; width: 240px;">
        <div>
            <span id="quan-span" style="font-size: 1.25em;">Quantity:</span> 

            <div class="inline-container" style="margin: 5px -10px 10px 0; display: flex; justify-content: center; align-items: center; width: 240px;">
                <button class="quantity-button" style="border: none; width: 40px; height: 40px; cursor: pointer; opacity: 1; border-radius: 32px; background: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 99.77%); justify-content: center; align-items: center;">-</button>
                <input id="buy-quantity" style="margin: 10px; width: 35%;" type="number" name="quantity" value="1" min="1" disabled>
                <button class="quantity-button" style="border: none; width: 40px; height: 40px; cursor: pointer; opacity: 1; border-radius: 32px; background: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 99.77%); justify-content: center; align-items: center;">+</button>
                <input type="checkbox" name="max" id="max" style="margin-left: 10px;"><label for="max"><span id="maxspan" style="font-weight: 600; color: rgb(201, 148, 0); text-decoration: underline; cursor: pointer; font-size: 1em;">Max</span></label>
            </div>
        </div>
    </div>
    <div id="setting-block">
        Button press delay: <input id="press-delay" type="range" min="20" max="75" value="45"><span id="press-delay-hint" style="font-size: 0.75em;"></span>
        <p></p>
        Button scan delay: <input id="scan-delay" type="range" min="15" max="30" value="20"><span id="scan-delay-hint" style="font-size: 0.75em;"></span>
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
    let item = document.getElementsByClassName(classes);
    while (item == null || item.length == 0) {
        await sleep(ms);
        item = document.getElementsByClassName(classes);
    }
    return item;
}
    
async function GetSingleElementRecursive(classes, ms, index) {
    return ((await GetElementsRecursive(classes, ms))[index]);
}

let retries = 0;
async function buy(quantity, pressDelay, scanDelay) {
    try {
        if (pressDelay == null || pressDelay == 0 || scanDelay == null || scanDelay == 0) {
            if (pressDelay == null || pressDelay == 0) pressDelay = 50;
            if (scanDelay == null || scanDelay == 0) scanDelay = 20;
        }
        else {
            pressDelay = parseInt(pressDelay);
            scanDelay = parseInt(scanDelay);
        }

        console.log("Buy has started");
        printGood("Auto-buy has started! Waiting for sale.");

        let button1 = await GetSingleElementRecursive(firstBtnClasses, scanDelay, 0);
        
        if (quantity == "max") {
            let maxBtn = await GetSingleElementRecursive(maxBtnClasses, scanDelay, 0);
            maxBtn.click();
            await sleep(pressDelay);
        }
        else {
            let plusBtn = await GetSingleElementRecursive(plusBtnClasses, scanDelay, 1);
            let pressQuantity = parseInt(quantity) - 1;
            while (pressQuantity != 0) {
                plusBtn.click();
                pressQuantity--;
            }
            await sleep(pressDelay);
        }
        
        button1.click();
        await sleep(pressDelay);
        
        let button2 = await GetSingleElementRecursive(secondBtnClasses, scanDelay, 0);
        while (button2 == null) {
            button2 = await GetSingleElementRecursive(secondBtnClasses, 10, 0);
        }
        await sleep(50);
        button2.click();
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
    minusBtn.disabled = true;
    plusBtn.disabled = true;
    
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

const dayMs = 86400000;
const hourMs = 3600000;
const minuteMs = 60000;
const secondMs = 1000;
let refreshBeforeMs = secondMs * 15; 
async function startRefreshWaiting() {
try {
    let timers = await GetElementsRecursive(timerClasses, 50); // null here
    if (timers.length == 0) {
        printWarning("No timers found!\n Disabled delayed purchase.");
        return;
    }; // no timers

    let days = parseInt(timers[0].innerHTML, 10);
    let hours = parseInt(timers[1].innerHTML, 10);
    let minutes = parseInt(timers[2].innerHTML, 10);
    let seconds = parseInt(timers[3].innerHTML, 10);
    
    let waitTime = days * dayMs + hours * hourMs + minutes * minuteMs + seconds * secondMs - refreshBeforeMs;
    console.log("Wait time: " + waitTime);
    await sleep(waitTime);
    
    if (refreshInput.checked == true || refreshInput.checked == "true") {
        setLocalData();
        document.location.reload();
    }
}
catch (e) {
    printWarning(e.stack);
}
}

/* */

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

function getElements() {
    try {
        msgSpan = document.querySelector('#msg-span');
        label = document.querySelector('#label');
        quantitySpan = document.querySelector('#quan-span');
        let buttons = document.querySelectorAll('.quantity-button');
        minusBtn = buttons[0];
        plusBtn = buttons[1];
        /*minusBtn.disabled = true;
        plusBtn.disabled = true;*/

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

window.addEventListener('load', async function() {
    try {
        createStartDiv();
        getElements();
        maxBtn.addEventListener('input', function(e) {
            isMax = this.checked;
            changeQuantityOpacity(isMax);
        });
        
        minusBtn.addEventListener('click', function() {
            changeQuantityInput(-1);
        });
        
        plusBtn.addEventListener('click', function() {
            changeQuantityInput(1);
        })
        
        buyButton.addEventListener('click', function() {
            buyPressed = true;
            buyButton.disabled = true;
            plusBtn.disabled = true;
            minusBtn.disabled = true;
            currentPressDelay = parseInt(pressDelayInput.value);
            currentScanDelay = parseInt(scanDelayInput.value);
            
            let quantityVal;
            if (isMax == true) {
                quantityVal = "max";
            }
            else {
                quantityVal = quantityValue;
            }
            
            buy(quantityVal, currentPressDelay, currentScanDelay);
        });
    
        document.querySelector('#press-delay-hint').innerHTML = minPressDelay + '-' + maxPressDelay + ' ms';
        document.querySelector('#scan-delay-hint').innerHTML = minScanDelay + '-' + maxScanDelay + ' ms';
        
        if (!trySetLocalData())
            startRefreshWaiting();
    
    } catch (e) {
        printWarning(e.stack);
    }
});

/* Test functions */
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey) {
        setLocalData();
        document.location.reload();
    }
});
/* */