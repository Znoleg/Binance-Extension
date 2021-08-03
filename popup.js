let label;
let quantitySpan;
let minusBtn, plusBtn;
let quantityInput;

let quantityValue, quantityMin = null, quantityMax = null;
let isMax = false;

function sendRequest(request, onComplete) {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, request, onComplete);
    });
}

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

window.addEventListener('load', function(){
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