const XLSX = require('xlsx');

const workbook = XLSX.readFile('Directorio_Empleados_2026-07-13.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log(jsonData[0]);
console.log(jsonData[1]);
