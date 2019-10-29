mui.init({
    swipeBack: true //启用右滑关闭功能
});

const clientWidth = document.documentElement.clientWidth;
const clientHeight = document.documentElement.clientHeight;

let divTag = document.getElementById("docDiv");
divTag.style.height = (clientHeight - 188) + 'px';

let searchLocationCode = document.getElementById("locationCodeText");
let frmSubmit = document.getElementById("frmSubmit");

// let elmts = document.querySelectorAll("td[barcode]");
// let emptyEle = document.querySelector("td[isEmpty=true]");
let docTable = document.getElementById('docTable');
let docTbody = document.getElementById('docTbody');
let elementsTr = docTbody.getElementsByTagName('tr');

const MessageTitle = "手持终端入库";
const FriendlyTips = "请扫描册条码！";
const ErrorMessage = "册条码错误，请重新扫描册条码！";
const SuccessMessage = "提交成功，扫描的册条码已入库!";
const SolicitMessage = '您是否要提交入库已扫描的册条码？';
const SolicitAction = ['是','否'];
const ConfirmTips = '您扫描的册条码正在提交入库！';
const CancelTips = '请您继续扫描要入库的册条码！';

initialize();

function initialize() {
    // 修改页面标题和主题
    document.title = MessageTitle;
    document.getElementById("docTitle").innerText = MessageTitle;
    frmSubmit.disabled = true;
}

frmSubmit.addEventListener('tap', function () {
    mui.confirm(SolicitMessage, MessageTitle, SolicitAction, function (e) {
        messageTips(e.index === 0 ? ConfirmTips : CancelTips);
    })
});

searchLocationCode.addEventListener('keypress', function () {
    if (event.keyCode === 13) {
        messageTips('输入库位是：' + this.value + clientHeight);
        searchLocation();
        frmSubmit.removeAttribute('disabled');
        registerBarCodeElementsKeyPressEvent();
    }
});

const isEmptyInnerHtml = obj => obj.innerHTML.trim().length <= 0;

const scanningBarcode = td => {
    let isEmpty = isEmptyInnerHtml(td);
    if (isEmpty) {
        td.innerHTML = '';
        td.focus();
        messageTips(FriendlyTips);
        return false;
    }
    //模拟数据验证
    if (validationVolumeCode(td)) {
        td.setAttribute('isEmpty', isEmpty);
        td.setAttribute('contentEditable', false);
        findNextElement(td);
        return true;
    }
};

const sum = (x, y) => x + y;

const messageTips = messageText => {
    mui.toast(messageText);
};

const validationVolumeCode = td => {
    //Check Validation
    let volumeCode = td.innerHTML.trim();
    let result = volumeCode.length >= 12;
    if (!result) {
        td.innerHTML = '';
        td.focus();
        volumeCode += " : " + ErrorMessage;
        messageTips(volumeCode);
    }
    return result;
};

const findNextElement = obj => {
    let parent = obj.parentElement, seq = parent.getAttribute('idx');
    if (seq < (elementsTr.length - 1)) {
        scanningBarcode(parent.nextElementSibling.getElementsByTagName('td')[1]);
    }
};

const registerBarCodeElementsKeyPressEvent = function () {
    const counts = elementsTr.length;
    for (let i = 0; i < counts; i++) {
        let objTr = elementsTr[i];
        objTr.setAttribute('idx', i.toString());
        let tds = objTr.getElementsByTagName('td');
        tds[0].setAttribute('name', 'locationId');
        let barcode = tds[1];
        let isEmpty = isEmptyInnerHtml(barcode);
        barcode.setAttribute('isEmpty', isEmpty);
        barcode.setAttribute('barCodeId', 'B000' + i);
        barcode.setAttribute('contentEditable', isEmpty);
        barcode.addEventListener('keypress', function () {
            if (event.keyCode === 13) {
                scanningBarcode(this);
                //屏蔽回车键输入
                event.returnValue = false;
            }
        });
    }
};

const searchLocation = () => {
    for (let i = 0; i < 999; i++) {
        let tr = document.createElement('tr');
        for (let t = 1; t <= 2; t++) {
            let td = document.createElement('td');
            td.innerHTML = 'C001-B000' + i;
            if (t === 2) {
                td.innerHTML = 'XXX-XX-XXX201900000' + i;
            }
            tr.appendChild(td);
        }
        docTbody.appendChild(tr);
    }
    docTable.appendChild(docTbody);
};

const submitFormData = function (e) {
    mui(this).button('loading');
    setTimeout(function () {
        mui(this).button('reset');
        messageTips(SuccessMessage);
    }.bind(this), 2000);
};
mui(document.body).on('tap', '.mui-btn', submitFormData);

const selectBarCodeTextWithClick = function () {
    if (document.body.createTextRange) {
        let range = document.body.createTextRange();
        range.select();
    } else if (window.getSelection) {
        let selection = window.getSelection();
        let range = document.createRange();
        range.selectNodeContents(this);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.log("none");
    }
};
mui("tr").on('tap', 'td[contentEditable=true]', selectBarCodeTextWithClick);