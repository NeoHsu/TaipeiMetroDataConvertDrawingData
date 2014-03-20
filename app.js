var fs = require('fs');
var originalMetroData = JSON.parse(fs.readFileSync("./original/data.json").toString());
//var originalMetroStationList = ["淡水", "紅樹林", "竹圍", "關渡", "忠義", "復興崗", "北投", "新北投", "奇岩", "唭哩岸", "石牌", "明德", "芝山", "士林", "劍潭", "圓山", "民權西路", "大橋頭", "三重國小", "三和國中", "徐匯中學", "三民高中", "蘆洲", "台北橋", "菜寮", "三重", "先嗇宮", "頭前莊", "新莊", "輔大", "丹鳳", "迴龍", "中山國小", "行天宮", "松江南京", "忠孝新生", "東門", "古亭", "頂溪", "永安市場", "景安", "南勢角", "雙連", "中山", "台北車站", "西門", "龍山寺", "江子翠", "新埔", "板橋", "府中", "亞東醫院", "南山", "土城", "永寧", "善導寺", "忠孝復興", "忠孝敦化", "國父紀念館", "市政府", "永春", "後山埤", "昆陽", "南港", "南港展覽館", "南京東路", "中山國中", "松山機場", "大直", "劍南路", "西湖", "港漧", "文湖", "內湖", "大湖公園", "葫洲", "東湖", "南港軟體園區", "大安", "科技大樓", "六張犛", "麟光", "辛亥", "萬芳醫院", "萬芳社區", "木柵", "動物園", "台大醫院", "中正紀念堂", "小南門", "大安森林公園", "信義安和", "台北101/世貿", "象山", "台電大樓", "公館", "萬隆", "景美", "大坪林", "七張", "新店區公所", "新店", "小碧潭"];
var originalMetroStationList = [];
var originalMetroCoordinateList = JSON.parse(fs.readFileSync("./original/Station_Coordinate_List.json").toString());
// console.dir(originalMetroData);
// console.log(originalMetroStationList.length);
// console.log(originalMetroCoordinateList.length);
var originalMetroDataLength = originalMetroData.length;
var originalMetroStationListLength = originalMetroCoordinateList.length;
var i, j, metroList = [];
for (i = 0; i < originalMetroDataLength; i++) {
    metroList.push(originalMetroData[i].nameTW);
}
for (i = 0; i < originalMetroStationListLength; i++) {
    originalMetroStationList.push(originalMetroCoordinateList[i].nameTW);
}
// console.dir(originalMetroStationList);
var Obj = [];
for (i = 0; i < originalMetroDataLength; i++) {
    var objOne = {};
    objOne.id = i;
    objOne.nameTW = originalMetroData[i].nameTW;
    // console.log(objOne.nameTW);
    var metroCoordinateIndex = originalMetroStationList.indexOf(objOne.nameTW);
    // console.log(metroCoordinateIndex);
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
    //console.log(originalMetroData[i].detail.length);
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
fs.writeFileSync("./ConvertDataForStation.json", JSON.stringify(Obj));

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


fs.writeFileSync("./ConvertDataForPath.json", JSON.stringify(pathObj));

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
fs.writeFileSync("./ConvertDataForMatrix.json", JSON.stringify(matrixDijkstra));

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
fs.writeFileSync("./ConvertDataForMatrixTest.json", JSON.stringify(matrixDijkstraTest));

// console.dir(pathObj);
// console.log(pathObj.length);
