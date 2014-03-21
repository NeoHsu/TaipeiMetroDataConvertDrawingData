var fs = require('fs');
var allDataForTaipeiMRT = "";

var settingConfig = JSON.parse(fs.readFileSync("./setting.json").toString());
var originalMetroData = JSON.parse(fs.readFileSync(settingConfig.originalStationDataList).toString());

var originalMetroStationList = [];
var originalMetroCoordinateList = JSON.parse(fs.readFileSync(settingConfig.originalPathCoordinateList).toString());

var originalMetroDataLength = originalMetroData.length;
var originalMetroStationListLength = originalMetroCoordinateList.length;
var i, j, metroList = [];
for (i = 0; i < originalMetroDataLength; i++) {
    metroList.push(originalMetroData[i].nameTW);
}
for (i = 0; i < originalMetroStationListLength; i++) {
    originalMetroStationList.push(originalMetroCoordinateList[i].nameTW);
}

var Obj = [];
for (i = 0; i < originalMetroDataLength; i++) {
    var objOne = {};
    objOne.id = i;
    objOne.nameTW = originalMetroData[i].nameTW;
    var metroCoordinateIndex = originalMetroStationList.indexOf(objOne.nameTW);
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

fs.writeFileSync(settingConfig.exportDirectory + "ConvertDataForStation.json", JSON.stringify(Obj));
allDataForTaipeiMRT = allDataForTaipeiMRT + "var Obj = " + JSON.stringify(Obj) + ";\n";
var pathObj = [];
var selectPathDirection = [1, 3, 5, 7, 8, 10, 11, 12, 15, 17];
for (var i = Obj.length - 1; i >= 0; i--) {
    var tmpObj = Obj[i];
    var tmpOne = {};
    tmpOne.nameTW = tmpObj.nameTW;
    tmpOne.col = tmpObj.col;
    tmpOne.row = tmpObj.row;
    var pathObjOneDetial = [];
    for (var j = tmpObj.detail.length - 1; j >= 0; j--) {
        var tmpArray = tmpObj.detail[j].direction;
        var tmpDetial = {};
        var tmpId = tmpObj.detail[j].id;
        tmpDetial.nameTW = Obj[tmpId].nameTW;
        tmpDetial.col = Obj[tmpId].col;
        tmpDetial.row = Obj[tmpId].row;
        tmpDetial.direction = [];

        for (var k = tmpArray.length - 1; k >= 0; k--) {
            if (selectPathDirection.indexOf(tmpArray[k]) === -1) break;
            tmpDetial.direction.push(tmpArray[k]);
        };
        if (tmpDetial.direction.length > 0) pathObjOneDetial.push(tmpDetial);
    };

    if (pathObjOneDetial.length > 0) {
        tmpOne.path = pathObjOneDetial;
        pathObj.push(tmpOne);

    }
};


fs.writeFileSync(settingConfig.exportDirectory + "ConvertDataForPath.json", JSON.stringify(pathObj));
allDataForTaipeiMRT = allDataForTaipeiMRT + "var ObjPath = " + JSON.stringify(pathObj) + ";\n";

var matrixDijkstra = [];
var i, j;
for (i = Obj.length - 1; i >= 0; i--) {
    var matrixOne = [];
    for (j = Obj.length - 1; j >= 0; j--) {
        matrixOne.push(999999);
    };
    var tmpOne = Obj[i];
    matrixOne[tmpOne.id] = 0;
    for (j = tmpOne.detail.length - 1; j >= 0; j--) {
        matrixOne[tmpOne.detail[j].id] = tmpOne.detail[j].distance;
    };
    matrixDijkstra.unshift(matrixOne);
};
fs.writeFileSync(settingConfig.exportDirectory + "ConvertDataForMatrix.json", JSON.stringify(matrixDijkstra));


var matrixDijkstraTest = [];
var i, j;
for (i = Obj.length - 1; i >= 0; i--) {
    var matrixOne = [];
    for (j = Obj.length - 1; j >= 0; j--) {
        matrixOne.push(999999);
    };
    var tmpOne = Obj[i];
    matrixOne[tmpOne.id] = 0;
    for (j = tmpOne.detail.length - 1; j >= 0; j--) {
        matrixOne[tmpOne.detail[j].id] = 1;
    };
    matrixDijkstraTest.unshift(matrixOne);
};
fs.writeFileSync(settingConfig.exportDirectory + "ConvertDataForMatrixTest.json", JSON.stringify(matrixDijkstraTest));
allDataForTaipeiMRT = allDataForTaipeiMRT + "var ObjMatrix = " + JSON.stringify(matrixDijkstraTest) + ";";

fs.writeFileSync(settingConfig.exportDataForTaipeiMRT, allDataForTaipeiMRT);
