const JOURNALIT_PROPERTY = 'JOURNALIT_WORKSPACE_SHEET_ID';
const CHUNK_SIZE = 40000;

function doGet() {
  const template = HtmlService.createTemplateFromFile('Bridge');
  template.allowedOrigins = (PropertiesService.getScriptProperties().getProperty('JOURNALIT_ALLOWED_ORIGINS') || '')
    .split(',').map(value => value.trim()).filter(Boolean);
  return template.evaluate()
    .setTitle('Journalit Google Sync')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getWorkspace() {
  const sheet = getWorkspaceSheet_();
  const count = Math.max(0, sheet.getLastRow() - 2);
  if (!count) return { payload: null };
  const chunks = sheet.getRange(3, 1, count, 1).getDisplayValues().flat();
  return { payload: JSON.parse(chunks.join('')) };
}

function saveWorkspace(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid journal data.');
  }
  const json = JSON.stringify(payload);
  if (json.length > 4500000) throw new Error('This journal is too large to store in one Google Sheet cell collection. Export a backup and reduce its size.');
  const lock = LockService.getUserLock();
  lock.waitLock(20000);
  try {
    const sheet = getWorkspaceSheet_();
    sheet.clearContents();
    sheet.getRange(1, 1, 2, 2).setValues([['Journalit workspace', 'Version 1'], ['Updated', new Date()]]);
    const chunks = [];
    for (let i = 0; i < json.length; i += CHUNK_SIZE) chunks.push([json.slice(i, i + CHUNK_SIZE)]);
    if (chunks.length) sheet.getRange(3, 1, chunks.length, 1).setValues(chunks);
    return { saved: true, updatedAt: new Date().toISOString() };
  } finally {
    lock.releaseLock();
  }
}

function getWorkspaceSheet_() {
  const props = PropertiesService.getUserProperties();
  let id = props.getProperty(JOURNALIT_PROPERTY);
  let book;
  if (id) {
    try { book = SpreadsheetApp.openById(id); } catch (err) { props.deleteProperty(JOURNALIT_PROPERTY); }
  }
  if (!book) {
    book = SpreadsheetApp.create('Journalit private workspace');
    props.setProperty(JOURNALIT_PROPERTY, book.getId());
    const sheet = book.getSheets()[0];
    sheet.setName('Workspace');
    sheet.getRange(1, 1, 2, 2).setValues([['Journalit workspace', 'Version 1'], ['Updated', new Date()]]);
    sheet.setFrozenRows(2);
  }
  return book.getSheetByName('Workspace') || book.getSheets()[0];
}
