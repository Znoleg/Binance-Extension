const labelClasses = "css-16xz99j";
const firstBtnClasses = "css-t1aewe";
const plusBtnClasses = "css-nphwqx";
const maxBtnClasses = "css-1rqdfgy";
const secondBtnClasses = "css-d8znws";

function TryGetButton(buttonClasses) {
    return document.getElementsByClassName(buttonClasses)[0];
}

async function TryGetButtonRecursive(buttonClasses, timeInterval, clickTimes) {
    let tid = null;
    
    let button = TryGetButton(buttonClasses);
    if (button == null) {
        tid = setTimeout(TryGetButtonRecursive.bind(null, buttonClasses, timeInterval), timeInterval);
    }
    else {
        if (tid != null) {
            clearTimeout(tid);
            tid = null;
        }
        clickTimes = parseInt(clickTimes);
        while (clickTimes != 0) {
            button.click();
            clickTimes--;
        }
    }
}

async function buy(quantity) {
    await TryGetButtonRecursive(firstBtnClasses, 25, 1);
    
    if (quantity == "max") {
        await TryGetButtonRecursive(maxBtnClasses, 25, 1);
    }
    else {
        await TryGetButtonRecursive(plusBtnClasses, 25, quantity);
    }
    
    await TryGetButtonRecursive(secondBtnClasses, 25, 1);
}

function getBuyInfo() {
    return TryGetButton(labelClasses).textContent;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let reqStr = request[0];
    if (reqStr == "init") {
        let labelText = getBuyInfo();
        sendResponse({label: labelText});
    }
    if (reqStr == "buy") buy(request[1]);
})