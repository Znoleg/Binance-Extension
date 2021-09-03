const labelClasses = "css-16xz99j";
const firstBtnClasses = "css-t1aewe";
const plusBtnClasses = "css-nphwqx";
const maxBtnClasses = "css-1rqdfgy";
const secondBtnClasses = "css-d8znws";
let container;

const html = `<p id="label" style="text-align: center; font-size: 1em;"></p>
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
    <div style="margin: 0 0 0 10px;">
        Button press delay: <input id="press-delay" type="range" min="20" max="75" value="45"><span id="press-delay-hint" style="font-size: 0.75em;"></span>
        <p></p>
        Button scan delay: <input id="scan-delay" type="range" min="15" max="30" value="20"><span id="scan-delay-hint" style="font-size: 0.75em;"></span>
    </div>
    <button id="buy" style="display: block; margin: 10px auto 0 auto; cursor: pointer; font-family: inherit; text-align: center; font-weight: 700; border: none; background-image: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 100%); height: 30px; width: 140px; font-size: 1em;">Start auto buy</button>
    <span id="msg-span" style="display:block; margin: 5px auto 0 auto; text-align: center; font-size: 0.8em"></span>`;

function TryGetButton(buttonClasses) {
    return document.getElementsByClassName(buttonClasses)[0];
}

async function TryGetButtonRecursive(buttonClasses, timeInterval) {
    let button = TryGetButton(buttonClasses);
    while (button == null) {
        await new Promise(resolve => setTimeout(resolve, timeInterval));
        button = TryGetButton(buttonClasses);
    }
    return button;
}

function TryGetButtonSec(buttonClasses) {
    return document.getElementsByClassName(buttonClasses)[1];
}

async function TryGetButtonRecursiveSec(buttonClasses, timeInterval) {
    let button = TryGetButton(buttonClasses);
    while (button == null) {
        await new Promise(resolve => setTimeout(resolve, timeInterval));
        button = TryGetButtonSec(buttonClasses);
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

        let button1 = await TryGetButtonRecursive(firstBtnClasses, scanDelay);
        
        if (quantity == "max") {
            let maxBtn = await TryGetButtonRecursive(maxBtnClasses, scanDelay);
            maxBtn.click();
            await new Promise(resolve => setTimeout(resolve, pressDelay));
        }
        /*else {
            let plusBtn = await TryGetButtonRecursiveSec(plusBtnClasses, scanDelay);
            let pressQuantity = parseInt(quantity) - 1;
            while (pressQuantity != 0) {
                plusBtn.click();
                pressQuantity--;
            }
            await new Promise(resolve => setTimeout(resolve, pressDelay));
        }*/
        
        button1.click();
        await new Promise(resolve => setTimeout(resolve, pressDelay));
        
        let button2 = await TryGetButtonRecursive(secondBtnClasses, scanDelay);
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

function getBuyInfo() {
    return TryGetButton(labelClasses).textContent;
}

let label;
let quantitySpan;
let minusBtn, plusBtn;
let quantityInput;
let msgSpan;

let quantityValue, quantityMin = null, quantityMax = null;
let isMax = false;

let pressDelayInput, scanDelayInput;
let minPressDelay, maxPressDelay, minScanDelay, maxScanDelay, currentPressDelay, currentScanDelay; //delays

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
    document.querySelector('#max').addEventListener('input', function(e) {
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
        currentPressDelay = parseInt(pressDelayInput.value);
        currentScanDelay = parseInt(scanDelayInput.value);

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
})

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

function getElements() {
    try {
        msgSpan = document.querySelector('#msg-span');
        label = document.querySelector('#label');
        quantitySpan = document.querySelector('#quan-span');
        let buttons = document.querySelectorAll('.quantity-button');
        minusBtn = buttons[0];
        plusBtn = buttons[1];
        minusBtn.disabled = true;
        plusBtn.disabled = true;

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
    }
    catch (e){
        printWarning("Something wrong on extenstion start.\n Try refresh a page\n" + e.stack);
    }
}