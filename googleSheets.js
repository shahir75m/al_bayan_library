const { google } = require('googleapis');

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

async function appendBookToSheet(book) {
  const { title, author, isbn, catalogNumber, publishingYear, publisher, bookPrice, category, totalCopies } = book;

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A1', // Appends to the first available row in Sheet1
    valueInputOption: 'RAW',
    resource: {
      values: [[title, author, isbn, catalogNumber, publishingYear, publisher, bookPrice, category, totalCopies, new Date().toLocaleDateString()]]
    },
  });
}

module.exports = { appendBookToSheet };
