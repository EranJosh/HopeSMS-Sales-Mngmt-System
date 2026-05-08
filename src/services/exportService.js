import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportSalesToExcel(salesData, filename = 'HopeSMS_Sales_Export') {
  const rows = salesData.map(s => ({
    'Trans No': s.transno,
    'Date': s.salesdate,
    'Customer': s.custname,
    'Sales Agent': s.empname,
    'Items': s.lineitemcount,
    'Total Amount': s.totalamount,
    'Status': s.record_status,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sales')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportSalesToPDF(salesData, filename = 'HopeSMS_Sales_Export') {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Hope, Inc. — Sales Report', 14, 15)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22)
  autoTable(doc, {
    startY: 28,
    head: [['Trans No', 'Date', 'Customer', 'Sales Agent', 'Items', 'Total']],
    body: salesData.map(s => [
      s.transno, s.salesdate, s.custname, s.empname, s.lineitemcount,
      `$${Number(s.totalamount).toFixed(2)}`
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
  })
  doc.save(`${filename}.pdf`)
}

export function exportTransactionDetailToPDF(sale, lineItems, filename) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Hope, Inc. — Transaction Receipt', 14, 15)
  doc.setFontSize(10)
  doc.text(`Transaction: ${sale.transno}`, 14, 25)
  doc.text(`Date: ${sale.salesdate}`, 14, 31)
  doc.text(`Customer: ${sale.custname}`, 14, 37)
  doc.text(`Sales Agent: ${sale.empname}`, 14, 43)
  autoTable(doc, {
    startY: 50,
    head: [['Product', 'Description', 'Qty', 'Unit Price', 'Line Total']],
    body: lineItems.map(li => [
      li.prodcode, li.description, li.quantity,
      `$${Number(li.unitprice).toFixed(2)}`,
      `$${Number(li.linetotal).toFixed(2)}`
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
    foot: [['', '', '', 'TOTAL', `$${lineItems.reduce((sum, li) => sum + Number(li.linetotal), 0).toFixed(2)}`]],
    footStyles: { fillColor: [26, 26, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
  })
  doc.save(filename || `${sale.transno}_receipt.pdf`)
}
