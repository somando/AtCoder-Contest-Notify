function get_contest() {
  const workbook = SpreadsheetApp.openById('{データベース用Google Sheet ID}');
  const sheet = workbook.getSheetByName('contest_data');
  var contest_data = sheet.getDataRange().getValues();
  var url = "https://atcoder.jp/contests/?lang=ja";
  let flag = 0;
  while(flag === 0) {
    flag = 1;
    try {
      var response = UrlFetchApp.fetch(url);
    } catch(e) {
      console.log("エラー" + e.message);
      Utilities.sleep(5000);
      flag = 0;
    }
  }
  var source = response.getContentText();
  var html = source.replace(/\n||\t/g, '');
  var search_start = html.indexOf('<h3>予定されたコンテスト</h3>');
  console.log(search_start);
  var contests_getdata = new Array();
  search_start = html.indexOf("<time class='fixtime fixtime-full'>", search_start) + 35;
  console.log(search_start);
  var contest_date_string = "";
  while (html[search_start] != '<') {
    contest_date_string += html[search_start];
    search_start += 1;
  }
  var box = "";
  var contest_date_box = contest_date_string.split(/ |-|:/);
  search_start = html.indexOf('</span>', search_start) - 1;
  console.log(search_start);
  console.log(contest_date_string);
  box = html[search_start];
  if (box === 'Ⓐ') {
    var contest_type = 'Algorithm';
  } else {
    var contest_type = 'Heuristic';
  }
  box = "https://atcoder.jp";
  var year = Number(contest_date_box[0]);
  var month = Number(contest_date_box[1]);
  var day = Number(contest_date_box[2]);
  var hour = Number(contest_date_box[3]);
  var minute = Number(contest_date_box[4]);
  console.log(year, month, day, hour, minute)
  var contest_date = new Date(year, month - 1, day, hour, minute);
  search_start = html.indexOf('<a href="/contests/', search_start) + 9;
  console.log(search_start);
  while (html[search_start] !== '"') {
    box += html[search_start];
    search_start += 1;
  }
  var contest_url = box;
  box = "";
  search_start += 2;
  while (html[search_start] !== '<') {
    box += html[search_start];
    search_start += 1;
  }
  var contest_title = box;
  box = "";
  search_start = html.indexOf('<td class="text-center">', search_start) + 24;
  console.log(search_start);
  while (html[search_start] !== '<') {
    box += html[search_start];
    search_start += 1;
  }
  var contest_time = box;
  box = "";
  search_start = html.indexOf('<td class="text-center">', search_start) + 24;
  console.log(search_start);
  while (html[search_start] !== '<') {
    box += html[search_start];
    search_start += 1;
  }
  var contest_rated = box;
  var contest_getdata = new Array();
  contest_getdata.push(contest_date, contest_type, contest_url, contest_title, contest_time, contest_rated);
  for (i = 1; i <= 6; i++) {
    sheet.getRange(2, i).setValue(contest_getdata[i - 1]);
  }
  const triggers = ScriptApp.getProjectTriggers();
  for(let i = 0; i < triggers.length; i++){
    if(triggers[i].getHandlerFunction() !== 'get_contest' && triggers[i].getHandlerFunction() !== 'set_trigger'){
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function morning_notify() {
  const workbook = SpreadsheetApp.openById('{データベース用Google Sheet ID}');
  const sheet = workbook.getSheetByName('contest_data');
  var contest_data = sheet.getDataRange().getValues();
  var contest_date = new Date(contest_data[1][0]);
  var contest_long = new Date(contest_data[1][4]);
  var message_text = "\n\n本日" + String(contest_date.getHours()) + "時" + String(contest_date.getMinutes()) + "分より、" + String(contest_long.getHours()) + "時間" + String(contest_long.getMinutes()) + "分間の" + contest_data[1][1] + "大会\n「 " + contest_data[1][3] + " 」が開催されます。\nRated対象は" + contest_data[1][5] + "です。\n\n以下リンクより参加登録が可能です。\n" + contest_data[1][2];
  
  const token = '{通知先LINE Notifyトークン}';
  const lineNotifyApi = 'https://notify-api.line.me/api/notify';
  const options = {"method"  : "post", "payload" : {"message": message_text}, "headers" : {"Authorization":"Bearer " + token}};
  UrlFetchApp.fetch(lineNotifyApi, options);
}

function before_start_notify() {
  const workbook = SpreadsheetApp.openById('{データベース用Google Sheet ID}');
  const sheet = workbook.getSheetByName('contest_data');
  var contest_data = sheet.getDataRange().getValues();
  var contest_date = new Date(contest_data[1][0]);
  var contest_long = new Date(contest_data[1][4]);
  var message_text = "\n\n残り30分でコンテストが開始されます。\n" + String(contest_date.getHours()) + "時" + String(contest_date.getMinutes()) + "分開始\n" + String(contest_long.getHours()) + "時間" + String(contest_long.getMinutes()) + "分間の" + contest_data[1][1] + "大会です。\n\n「 " + contest_data[1][3] + " 」\nRated対象は" + contest_data[1][5] + "です。\n\n以下リンクより参加登録が可能です。\n" + contest_data[1][2] + "\n\nコンテスト開始後に以下URLより問題を確認できます。\n" + contest_data[1][2] + "/tasks_print";

  const token = '{通知先LINE Notifyトークン}';
  const lineNotifyApi = 'https://notify-api.line.me/api/notify';
  const options = {"method"  : "post", "payload" : {"message": message_text}, "headers" : {"Authorization":"Bearer " + token}};
  UrlFetchApp.fetch(lineNotifyApi, options);
}

function set_trigger() {
  const workbook = SpreadsheetApp.openById('{データベース用Google Sheet ID}');
  const sheet = workbook.getSheetByName('contest_data');
  var contest_data = sheet.getDataRange().getValues();
  var contest_date = new Date(contest_data[1][0]);
  let time = new Date();
  console.log(contest_date);
  console.log(time);
  if (contest_date.getMonth() == time.getMonth() && contest_date.getDate() == time.getDate()) {
    var set_m = new Date();
    var set_n = new Date();
    set_m.setHours(7);
    set_m.setMinutes(00);
    set_n.setHours(contest_date.getHours());
    set_n.setMinutes(contest_date.getMinutes() - 30);
    ScriptApp.newTrigger('morning_notify').timeBased().at(set_m).create();
    ScriptApp.newTrigger('before_start_notify').timeBased().at(set_n).create();
  }
}