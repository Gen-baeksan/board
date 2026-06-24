const SHEET_NAME = 'posts';

// ── GET: 전체 게시글 반환 ──────────────────────────────────────
function doGet(e) {
  const sheet = getSheet();
  if (!sheet) return json({ error: '시트를 찾을 수 없습니다.' });

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return json({ posts: [] });

  const posts = rows.slice(1).map(r => ({
    id:      Number(r[0]),
    author:  r[1],
    title:   r[2],
    content: r[3],
    date:    r[4],
  }));

  return json({ posts });
}

// ── POST: 글 작성 / 삭제 ──────────────────────────────────────
function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const sheet   = getSheet();
  if (!sheet) return json({ success: false, error: '시트를 찾을 수 없습니다.' });

  if (payload.action === 'create') {
    sheet.appendRow([payload.id, payload.author, payload.title, payload.content, payload.date]);
    return json({ success: true });
  }

  if (payload.action === 'delete') {
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (Number(values[i][0]) === Number(payload.id)) {
        sheet.deleteRow(i + 1);
        return json({ success: true });
      }
    }
    return json({ success: false, error: '게시글을 찾을 수 없습니다.' });
  }

  return json({ success: false, error: '알 수 없는 action입니다.' });
}

// ── 헬퍼 ──────────────────────────────────────────────────────
function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── 최초 1회 실행: 시트 & 헤더 생성 ──────────────────────────
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'author', 'title', 'content', 'date']);
    sheet.getRange(1, 1, 1, 5)
      .setFontWeight('bold')
      .setBackground('#e8eaf6');
    sheet.setFrozenRows(1);
  }

  Logger.log('✅ 설정 완료! "posts" 시트가 준비되었습니다.');
}
