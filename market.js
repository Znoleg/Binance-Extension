const labelClasses = "css-16xz99j";
const firstBtnClasses = "css-t1aewe";
const plusBtnClasses = "css-nphwqx";
const maxBtnClasses = "css-1rqdfgy";
const secondBtnClasses = "css-d8znws";
    

const html = `<p id="label"></p>
    <div class="inline-container" style="margin: 5px 0 10px 0; display: flex; justify-content: center; align-items: center; width: 240px;">
        <div>
            <span id="quan-span" style="font-size: 1.25em;">Quantity:</span> 

            <div class="inline-container" style="margin: 5px -10px 10px 0; display: flex; justify-content: center; align-items: center; width: 240px;">
                <button class="quantity-button" style="border: none; width: 40px; height: 40px; cursor: pointer; opacity: 1; border-radius: 32px; background: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 99.77%); justify-content: center; align-items: center;">-</button>
                <input id="buy-quantity" style="margin: 10px; width: 35%;" type="number" name="quantity" value="0" min="0" disabled>
                <button class="quantity-button" style="border: none; width: 40px; height: 40px; cursor: pointer; opacity: 1; border-radius: 32px; background: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 99.77%); justify-content: center; align-items: center;">+</button>
                <input type="checkbox" name="max" id="max" style="margin-left: 10px;"><label for="max"><span id="maxspan" style="font-weight: 600; color: rgb(201, 148, 0); text-decoration: underline; cursor: pointer; font-size: 1em;">Max</span></label>
            </div>
        </div>
    </div>
    <button id="buy" style="display: block; margin: 0 auto 0 auto; cursor: pointer; font-family: inherit; text-align: center; font-weight: 700; border: none; background-image: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 100%); height: 30px; width: 140px; font-size: 1em;">Start auto buy</button>`;

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

async function buy(quantity) {
    let button1 = await TryGetButtonRecursive(firstBtnClasses, 25);
    button1.click();
    
    if (quantity == "max") {
        let maxBtn = await TryGetButtonRecursive(maxBtnClasses, 25);
        maxBtn.click();
    }
    else {
        let plusBtn = await TryGetButtonRecursive(plusBtnClasses, 25);
        quantity = parseInt(quantity);
        while (quantity != 0) {
            plusBtn.click();
            quantity--;
        }
    }
    
    let button2 = await TryGetButtonRecursive(secondBtnClasses, 25);
    button2.click();
}

function getBuyInfo() {
    return TryGetButton(labelClasses).textContent;
}

let label;
let quantitySpan;
let minusBtn, plusBtn;
let quantityInput;

let quantityValue, quantityMin = null, quantityMax = null;
let isMax = false;

window.addEventListener('load', async function() {
    let container = document.createElement('div');
    container.style.backgroundColor = '#fafafa';
    container.style.width = '256px';
    container.style.height = '135px';
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
    
    document.querySelector('#buy').addEventListener('click', function() {
        label.textContent = getBuyInfo();
        
        let quantityVal;
        if (isMax == true) {
            quantityVal = "max";
        }
        else {
            quantityVal = quantityValue;
        }
        
        buy(quantityVal);
    });
})

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

function getElements() {
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
}