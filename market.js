const labelClasses = "css-16xz99j";
const firstBtnClasses = "css-t1aewe";
const plusBtnClasses = "css-nphwqx";
const maxBtnClasses = "css-1rqdfgy";
const secondBtnClasses = "css-d8znws";
const timerClasses = "css-isd1ku";
let container;

const html = `<p id="label"></p>
    <div class="inline-container">
        <div>
            <span id="quan-span">Quantity:</span> 

            <div class="inline-container">
                <button class="quantity-button">-</button>
                <input id="buy-quantity" type="number" name="quantity" value="1" min="1" disabled>
                <button class="quantity-button">+</button>
                <input type="checkbox" name="max" id="max"><label for="max"><span id="maxspan">Max</span></label>
            </div>
        </div>
    </div>
    <div id="setting-block"">
        Button press delay: <input id="press-delay" type="range" min="20" max="75" value="45"><span id="press-delay-hint"></span>
        <p></p>
        Button scan delay: <input id="scan-delay" type="range" min="15" max="30" value="20"><span id="scan-delay-hint"></span>
        <p></p>
        <input type="checkbox" name="refresh-input" id="refresh-input"><label for="refresh-input">Delayed purchase</label>
    </div>
    <button id="buy">Start auto buy</button>
    <span id="msg-span"></span>`;

/* Buy functions */

function TryGetButton(buttonClasses) {
    return document.getElementsByClassName(buttonClasses);
}

async function TryGetButtonRecursive(buttonClasses, timeInterval) {
    let button = TryGetButton(buttonClasses);
    while (button == null) {
        await new Promise(resolve => setTimeout(resolve, timeInterval));
        button = TryGetButton(buttonClasses);
    }
    return button;
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
        printGood("Auto-buy has started! Waiting for sale.");

        let button1 = await TryGetButtonRecursive(firstBtnClasses, scanDelay)[0];
        
        if (quantity == "max") {
            let maxBtn = await TryGetButtonRecursive(maxBtnClasses, scanDelay)[0];
            maxBtn.click();
            await new Promise(resolve => setTimeout(resolve, pressDelay));
        }
        else {
            let plusBtn = await TryGetButtonRecursiveSec(plusBtnClasses, scanDelay)[1];
            let pressQuantity = parseInt(quantity) - 1;
            while (pressQuantity != 0) {
                plusBtn.click();
                pressQuantity--;
            }
            await new Promise(resolve => setTimeout(resolve, pressDelay));
        }
        
        button1.click();
        await new Promise(resolve => setTimeout(resolve, pressDelay));
        
        let button2 = await TryGetButtonRecursive(secondBtnClasses, scanDelay)[0];
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

/* */

let label;
let quantitySpan;
let maxBtn, minusBtn, plusBtn;
let quantityInput;
let msgSpan;

let quantityValue, quantityMin = null, quantityMax = null;
let isMax = false;

let pressDelayInput, scanDelayInput;
let minPressDelay, maxPressDelay, minScanDelay, maxScanDelay; //delays

let refreshInput;

//// Visual functions

function getBuyInfo() {
    return TryGetButton(labelClasses).textContent;
}

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

////

//// Data functions

function setLocalData() {
    localStorage.setItem("isMax", isMax);
    localStorage.setItem("quantityValue", quantityValue);
    localStorage.setItem("pressDelay", pressDelayInput.value);
    localStorage.setItem("scanDelay", scanDelayInput.value);
}

function clearLocalData() {
    localStorage.removeItem("isMax");
    localStorage.removeItem("quantityValue");
    localStorage.removeItem("pressDelay");
    localStorage.removeItem("scanDelay");
}

function trySetLocalData() {
    let isMax = localStorage.getItem("isMax");
    
    if (isMax != null) {
        if (isMax == "true") { 
            maxBtn.click();
        }
        else {
            quantityValue = parseInt(localStorage.getItem("quantityValue"));
            quantityInput.value = quantityValue;
        }

        pressDelayInput.value = parseInt(localStorage.getItem("pressDelay"));
        scanDelayInput.value = parseInt(localStorage.getItem("scanDelay"));
        clearLocalData();
    }
}

const dayMs = 86400000;
const hourMs = 3600000;
const minuteMs = 60000;
const secondMs = 1000;
let refreshBeforeMs = secondMs * 15; 
async function startRefreshWaiting() {
    let timers = await TryGetButtonRecursive(timerClasses, 50); // null here
    if (timers.length == 0) return; // no timers

    let days = parseInt(timers[0].innerHTML, 10);
    let hours = parseInt(timers[1].innerHTML, 10);
    let minutes = parseInt(timers[2].innerHTML, 10);
    let seconds = parseInt(timers[3].innerHTML, 10);

    
    let waitTime = days * dayMs + hours * hourMs + minutes * minuteMs + seconds * secondMs - refreshBeforeMs;
    alert(waitTime + " " + refreshInput.checked);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    if (refreshInput.checked == true || refreshInput.checked == "true") {
        setLocalData();
        document.location.reload();
    }
}

////

function getElements() {
    try {
        msgSpan = document.querySelector('#msg-span');
        label = document.querySelector('#label');
        quantitySpan = document.querySelector('#quan-span');
        maxBtn = document.querySelector('#max');
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

        pressDelayInput = document.querySelector('#press-delay');
        scanDelayInput = document.querySelector('#scan-delay');
        if (!pressDelayInput.hasAttribute('min') || !pressDelayInput.hasAttribute('max') || !pressDelayInput.hasAttribute('value')
        || !scanDelayInput.hasAttribute('min') || !scanDelayInput.hasAttribute('max') || !scanDelayInput.hasAttribute('value')) 
            throw "No ms inputs min-max-value";
        
        minPressDelay = parseInt(pressDelayInput.getAttribute('min'));
        maxPressDelay = parseInt(pressDelayInput.getAttribute('max'));
        minScanDelay = parseInt(scanDelayInput.getAttribute('min'));
        maxScanDelay = parseInt(scanDelayInput.getAttribute('max'));

        refreshInput = document.querySelector('#refresh-input');
    }
    catch (e){
        printWarning("Something wrong on extenstion start.\n Try refresh a page\n" + e.stack);
    }
}

window.addEventListener('load', async function() {
    container = document.createElement('div');
    container.style.backgroundColor = '#fafafa';
    container.style.width = '276px';
    container.style.height = '185px';
    container.style.position = 'fixed';
    container.style.bottom = '5%';
    container.style.left = '5%';
    container.style.outline = '3px solid rgb(240, 185,11)';
    container.innerHTML = html;
    document.body.appendChild(container);
    
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
    
    let buyButton = document.querySelector('#buy');
    buyButton.addEventListener('click', function() {
        buyButton.disabled = true;
        let currentPressDelay = parseInt(pressDelayInput.value);
        let currentScanDelay = parseInt(scanDelayInput.value);

        label.textContent = getBuyInfo();
        
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

    trySetLocalData();
    await startRefreshWaiting();

    /*let response = await this.fetch("https://localhost:44389/api/Binance");
    alert(response.body);*/
});