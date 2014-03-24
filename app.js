var fs = require('fs');

// 儲存整理過的資料
var allDataForTaipeiMRT = "";

// 讀取設定檔＆站點資料＆站點位置座標資料
var settingConfig = JSON.parse(fs.readFileSync("./setting.json").toString());
var originalMetroData = JSON.parse(fs.readFileSync(settingConfig.originalStationDataList).toString());
var originalMetroCoordinateList = JSON.parse(fs.readFileSync(settingConfig.originalPathCoordinateList).toString());

// 計算站點資料數＆站點位置座標資料數
var originalMetroDataLength = originalMetroData.length;
var originalMetroCoordinateListLength = originalMetroCoordinateList.length;

var i, j, k;

// 將站點資料＆站點位置座標資料建立成以中文站名做為主鍵的 Array，並可以利用該 Array 去找出資料的索引
// metroList: 站點資料的中文站名陣列索引
// metroCoordinateList: 站點位置座標的中文站名陣列索引
var metroList = [],
    metroCoordinateList = [];
for (i = 0; i < originalMetroDataLength; i++) {
    metroList.push(originalMetroData[i].nameTW);
}
for (i = 0; i < originalMetroCoordinateListLength; i++) {
    metroCoordinateList.push(originalMetroCoordinateList[i].nameTW);
}

// Obj: 存取整理後的 Taipei MRT Station 資料
var Obj = [];
for (i = 0; i < originalMetroDataLength; i++) {
    var objOne = {};
    objOne.id = i;
    objOne.nameTW = originalMetroData[i].nameTW;
    var metroCoordinateIndex = metroCoordinateList.indexOf(objOne.nameTW);
    objOne.nameEN = originalMetroData[i].nameEn;
    objOne.row = originalMetroCoordinateList[metroCoordinateIndex].row;
    objOne.col = originalMetroCoordinateList[metroCoordinateIndex].col;
    if (originalMetroCoordinateList[metroCoordinateIndex].txtDirection === undefined) {
        objOne.txtDirection = 1;
    } else {
        objOne.txtDirection = originalMetroCoordinateList[metroCoordinateIndex].txtDirection;
    }

    objOne.detail = [];
    objOne.toStation = [];
    for (j = (originalMetroData[i].detail.length - 1); j >= 0; j--) {
        if (metroList.indexOf(originalMetroData[i].detail[j].nameTW) === -1) continue;
        var objOneDetail = {};
        objOneDetail.id = metroList.indexOf(originalMetroData[i].detail[j].nameTW);
        objOneDetail.distance = originalMetroData[i].detail[j].distance;
        objOneDetail.direction = originalMetroData[i].detail[j].direction;
        objOne.toStation.push(objOneDetail.id);
        objOne.detail.push(objOneDetail);
    }
    objOne.toStation.sort();
    Obj.push(objOne);
}

// 將 Taipei MRT 各站資料寫入檔案並暫時存入 allDataForTaipeiMRT 變數
fs.writeFileSync(settingConfig.exportDirectory + "ConvertDataForStation.json", JSON.stringify(Obj));
allDataForTaipeiMRT = allDataForTaipeiMRT + "var Obj = " + JSON.stringify(Obj) + ";\n";

// 整理畫出地圖路線的資料：各站連接的路線＆顏色
var pathObj = [];
var selectPathDirection = [1, 3, 5, 7, 8, 10, 11, 12, 15, 17];
for (i = Obj.length - 1; i >= 0; i--) {
    var tmpObj = Obj[i];
    var tmpOne = {};
    tmpOne.nameTW = tmpObj.nameTW;
    tmpOne.col = tmpObj.col;
    tmpOne.row = tmpObj.row;
    var pathObjOneDetial = [];
    for (j = tmpObj.detail.length - 1; j >= 0; j--) {
        var tmpArray = tmpObj.detail[j].direction;
        var tmpDetial = {};
        var tmpId = tmpObj.detail[j].id;
        tmpDetial.nameTW = Obj[tmpId].nameTW;
        tmpDetial.col = Obj[tmpId].col;
        tmpDetial.row = Obj[tmpId].row;
        tmpDetial.direction = [];
        for (k = tmpArray.length - 1; k >= 0; k--) {
            if (selectPathDirection.indexOf(tmpArray[k]) === -1) break;
            tmpDetial.direction.push(tmpArray[k]);
        }
        if (tmpDetial.direction.length > 0) pathObjOneDetial.push(tmpDetial);
    }
    if (pathObjOneDetial.length > 0) {
        tmpOne.path = pathObjOneDetial;
        pathObj.push(tmpOne);

    }
}

// 將地圖路線的資料寫入檔案並暫時存入 allDataForTaipeiMRT 變數
fs.writeFileSync(settingConfig.exportDirectory + "ConvertDataForPath.json", JSON.stringify(pathObj));
allDataForTaipeiMRT = allDataForTaipeiMRT + "var ObjPath = " + JSON.stringify(pathObj) + ";\n";

// 站與站間的路線權重表：建立各站連接的路線權重表，目前各路線權重為 1 ，利用 dijkstra 演算法去計算經過最少站為主的路線規劃
var matrixDijkstra = [];
for (i = Obj.length - 1; i >= 0; i--) {
    var matrixOne = [];
    for (j = Obj.length - 1; j >= 0; j--) {
        matrixOne.push(999999);
    }
    var tmpOne = Obj[i];
    matrixOne[tmpOne.id] = 0;
    for (j = tmpOne.detail.length - 1; j >= 0; j--) {
        matrixOne[tmpOne.detail[j].id] = 1;
    }
    matrixDijkstra.unshift(matrixOne);
}

// 將站與站間的路線權重表寫入檔案並暫時存入 allDataForTaipeiMRT 變數
fs.writeFileSync(settingConfig.exportDirectory + "ConvertDataForMatrix.json", JSON.stringify(matrixDijkstra));
allDataForTaipeiMRT = allDataForTaipeiMRT + "var ObjMatrix = " + JSON.stringify(matrixDijkstra) + ";\n";

// 讀取各路線編號＆路線顏色＆路線方向的資料並暫時存入 allDataForTaipeiMRT 變數
var ObjLine = JSON.parse(fs.readFileSync(settingConfig.originalLineDataList).toString());
allDataForTaipeiMRT = allDataForTaipeiMRT + "var ObjLine = " + JSON.stringify(ObjLine) + ";";

// 將 allDataForTaipeiMRT 變數的資料寫入 settingConfig.exportDataForTaipeiMRT 位置中
fs.writeFileSync(settingConfig.exportDataForTaipeiMRT, allDataForTaipeiMRT);