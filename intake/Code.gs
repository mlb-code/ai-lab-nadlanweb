/**
 * AI Lab Urban — שאלון הכרות למשרדי עורכי דין (urban.ai-lab.co.il/intake/)
 * Apps Script צמוד לגיליון: מקבל את תשובות השאלון, שומר שורה בגיליון ושולח מייל מסודר למאיר.
 *
 * הגדרה (פעם אחת, כ-3 דקות):
 * 1. יוצרים גיליון Google חדש בשם "שאלוני הכרות — משרדי עו״ד".
 * 2. בגיליון: תפריט Extensions (תוספים) → Apps Script.
 * 3. מוחקים את הקוד שיש שם, מדביקים את כל הקובץ הזה, שומרים (Ctrl+S).
 * 4. בסרגל למעלה בוחרים את הפונקציה setupSheet ולוחצים Run. מאשרים הרשאות
 *    (Review permissions → החשבון שלך → Advanced → Go to… (unsafe) → Allow).
 * 5. Deploy → New deployment → ⚙ → Web app → Execute as: Me → Who has access: Anyone → Deploy.
 * 6. מעתיקים את כתובת ה-Web App (מסתיימת ב-/exec) ושולחים לקלוד.
 */

const SHEET_TAB_NAME = 'תשובות';
const NOTIFY_EMAIL = 'laviemb@gmail.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const answers = Array.isArray(data.answers) ? data.answers : [];
    if (!answers.length) return jsonResponse({ success: false, error: 'אין תשובות' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_TAB_NAME);
    if (!sheet) { sheet = ss.insertSheet(SHEET_TAB_NAME); sheet.setRightToLeft(true); }

    // כותרות: תאריך + כל שאלה לפי הסדר + סטטוס + הערות. נוצרות אוטומטית בשליחה הראשונה.
    const wanted = ['תאריך'].concat(answers.map(a => a.q)).concat(['סטטוס', 'הערות']);
    let headers = sheet.getLastRow() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    if (!headers.length || !headers[0]) { headers = wanted; writeHeaders(sheet, headers); }
    // שאלות חדשות שלא היו בעבר נוספות כעמודות בסוף
    wanted.forEach(h => { if (headers.indexOf(h) === -1) { headers.push(h); writeHeaders(sheet, headers); } });

    const row = headers.map(h => {
      if (h === 'תאריך') return new Date();
      if (h === 'סטטוס') return 'חדש';
      if (h === 'הערות') return '';
      const hit = answers.find(a => a.q === h);
      return hit ? String(hit.a || '').slice(0, 2000) : '';
    });
    sheet.appendRow(row);

    sendNotificationEmail(answers, data.meta || {}, ss.getUrl());
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err && err.message || err) });
  }
}

function writeHeaders(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#17171C').setFontColor('#EAE6DC');
  sheet.setFrozenRows(1);
}

function sendNotificationEmail(answers, meta, sheetUrl) {
  try {
    const get = q => { const h = answers.find(a => a.q === q); return h ? h.a : ''; };
    const name = get('שם מלא') || 'ללא שם', firm = get('שם המשרד'), phone = get('טלפון');
    const subject = 'שאלון הכרות חדש: ' + name + (firm ? ' · ' + firm : '');
    const trs = answers.map(a =>
      '<tr><td style="padding:8px 14px;font-weight:700;background:#f4f4f8;border:1px solid #e2e2ec;width:34%;vertical-align:top">' + esc(a.q) +
      '</td><td style="padding:8px 14px;border:1px solid #e2e2ec;white-space:pre-wrap">' + (a.a ? esc(a.a) : '<span style="color:#aaa">—</span>') + '</td></tr>').join('');
    const wa = phone ? 'https://wa.me/972' + String(phone).replace(/\D/g, '').replace(/^0/, '') : '';
    const html =
      '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:680px;margin:auto">' +
      '<h2 style="color:#B5784A;margin-bottom:4px">שאלון הכרות — משרד עו״ד</h2>' +
      '<p style="color:#666;margin-top:0">' + esc(name) + (firm ? ' · ' + esc(firm) : '') + '</p>' +
      '<table style="border-collapse:collapse;width:100%;font-size:14px">' + trs + '</table>' +
      (wa ? '<p style="margin-top:18px"><a href="' + wa + '" style="background:#1FA855;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px">לענות בוואטסאפ</a></p>' : '') +
      '<p style="color:#888;font-size:13px;margin-top:18px">הגיליון: ' + sheetUrl + '<br>מקור: ' + esc(meta.source || '') + '</p></div>';
    MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, htmlBody: html, replyTo: NOTIFY_EMAIL });
  } catch (err) {
    Logger.log('שגיאת מייל: ' + err);
  }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function doGet() {
  return ContentService.createTextOutput('AI Lab Urban intake — Web App פעיל').setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** הרצה ידנית פעם אחת: יוצר לשונית "תשובות" ב-RTL. הכותרות נוצרות לבד בשליחה הראשונה. */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_TAB_NAME);
  if (!sheet) {
    const first = ss.getSheets()[0];
    if (first && first.getLastRow() === 0) { first.setName(SHEET_TAB_NAME); sheet = first; }
    else sheet = ss.insertSheet(SHEET_TAB_NAME);
  }
  sheet.setRightToLeft(true);
  sheet.setColumnWidth(1, 150);
  Logger.log('מוכן: ' + ss.getUrl());
}
