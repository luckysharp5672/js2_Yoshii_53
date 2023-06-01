document.addEventListener("DOMContentLoaded", function() {
  // 初期設定
  var datePicker = document.getElementById("datePicker");
  var drinkType = document.getElementById("drinkType");
  var countButton = document.getElementById("countButton");
  var graphButton = document.getElementById("graphButton");
  var resetButton = document.getElementById("resetButton");
  var drinkTable = document.getElementById("drinkTable");
  var drinkTableBody = drinkTable.getElementsByTagName("tbody")[0];
  var chartCanvas = document.getElementById("chart");

  // カウントデータの初期化
  var countData = {};

  // 今日の日付を初期値として設定
  var today = new Date();
  datePicker.value = today.toISOString().slice(0, 10);

  // お酒の種類の選択肢
  var drinkTypes = ["ビール", "ハイボール", "焼酎", "日本酒", "ワイン", "その他"];

  // お酒の種類の選択肢を生成
  drinkTypes.forEach(function(type) {
    var option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    drinkType.appendChild(option);
  });

  // カウントアップボタンがクリックされた時の処理
  countButton.addEventListener("click", function() {
    var date = datePicker.value;
    var types = Array.from(drinkType.selectedOptions, option => option.value);

    // カウントアップ
    types.forEach(function(type) {
      var key = "drink_" + date + "_" + type;
      if (!countData[key]) {
        countData[key] = {
          date: date,
          type: type,
          count: 1
        };
      } else {
        countData[key].count++;
      }
    });

    // テーブルに表示
    updateTable();
  });

  // グラフ作成ボタンがクリックされた時の処理
  graphButton.addEventListener("click", function() {
    // 日付ごとの集計データを取得
    var aggregateData = aggregateByDate();

    // グラフを作成
    createGraph(aggregateData);
  });

  // 非表示ボタンがクリックされた時の処理
  resetButton.addEventListener("click", function() {
    // テーブルの内容をクリア
    drinkTableBody.innerHTML = "";

    // グラフを初期化
    if (window.chartInstance) {
      window.chartInstance.destroy();
    }
  });

  // テーブルを更新する関数
  function updateTable() {
    // テーブルの内容をクリア
    drinkTableBody.innerHTML = "";

    // 日付ごとの集計データを取得
    var aggregateData = aggregateByDate();

    // 集計データをテーブルに表示
    aggregateData.forEach(function(dataItem) {
      var row = document.createElement("tr");
      var dateCell = document.createElement("td");
      dateCell.textContent = dataItem.date;
      var typeCell = document.createElement("td");
      typeCell.textContent = dataItem.type;
      var countCell = document.createElement("td");
      countCell.textContent = dataItem.count;
      row.appendChild(dateCell);
      row.appendChild(typeCell);
      row.appendChild(countCell);
      drinkTableBody.appendChild(row);
    });
  }

  // 日付ごとにカウントを集計する関数
  function aggregateByDate() {
    var aggregateData = [];
    for (var key in countData) {
      if (countData.hasOwnProperty(key)) {
        var dataItem = countData[key];
        var existingItem = aggregateData.find(function(item) {
          return item.date === dataItem.date && item.type === dataItem.type;
        });
        if (existingItem) {
          existingItem.count += dataItem.count;
        } else {
          aggregateData.push({
            date: dataItem.date,
            type: dataItem.type,
            count: dataItem.count
          });
        }
      }
    }
    return aggregateData;
  }

  // グラフを作成する関数
  function createGraph(aggregateData) {
    // 日付の配列を作成
    var dates = Array.from(new Set(aggregateData.map(function(dataItem) {
      return dataItem.date;
    })));

    // データセットを作成
    var datasets = drinkTypes.map(function(type, index) {
      var color = generateColorPalette(drinkTypes.length)[index];
      var data = dates.map(function(date) {
        var item = aggregateData.find(function(dataItem) {
          return dataItem.date === date && dataItem.type === type;
        });
        return item ? item.count : 0;
      });

      return {
        label: type,
        backgroundColor: color,
        data: data
      };
    });

    // グラフを作成
    if (window.chartInstance) {
      window.chartInstance.destroy();
    }
    window.chartInstance = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: dates,
        datasets: datasets
      },
      options: {
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: "日付"
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: "杯数"
            }
          }
        }
      }
    });
  }

  // ランダムなカラーパレットを生成する関数
  function generateColorPalette(count) {
    var palette = [];
    var hueStep = 360 / count;
    var currentHue = 0;
    for (var i = 0; i < count; i++) {
      var color = "hsl(" + currentHue + ", 70%, 50%)";
      palette.push(color);
      currentHue += hueStep;
    }
    return palette;
  }

  // ページロード時に保存されているデータを復元
  restoreData();

  // データを復元する関数
  function restoreData() {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.startsWith("drink_")) {
        var parts = key.split("_");
        var date = parts[1];
        var type = parts[2];
        var count = localStorage.getItem(key);

        var dataKey = date + "_" + type;
        if (!countData[dataKey]) {
          countData[dataKey] = {
            date: date,
            type: type,
            count: parseInt(count)
          };
        } else {
          countData[dataKey].count += parseInt(count);
        }
      }
    }

    // テーブルを更新
    updateTable();
  }
  
});

