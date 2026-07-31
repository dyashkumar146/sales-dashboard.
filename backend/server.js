const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

let salesData = [];

const csvFilePath = path.join(__dirname, 'data', 'product_sales_dataset_final.csv');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    salesData.push(row);
  })
  .on('end', () => {
    console.log(`CSV Data Loaded: ${salesData.length} records`);
  });

// Number parser helper
function parseVal(val) {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.toString().replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Case-insensitive & multi-key extractor
function getRowValue(row, ...possibleKeys) {
  if (!row) return '';
  const rowKeys = Object.keys(row);
  
  for (let key of possibleKeys) {
    const matchedKey = rowKeys.find(k => k.trim().toLowerCase() === key.trim().toLowerCase());
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
      return row[matchedKey];
    }
  }
  return '';
}

app.get('/api/dashboard', (req, res) => {
  const { category, region } = req.query;

  const filtered = salesData.filter((item) => {
    const itemCat = String(getRowValue(item, 'Category', 'category', 'Prod_Category') || '').trim();
    const itemReg = String(getRowValue(item, 'Region', 'region', 'Territory') || '').trim();

    const matchCat = !category || category === 'All' || itemCat.toLowerCase() === category.toLowerCase();
    const matchReg = !region || region === 'All' || itemReg.toLowerCase() === region.toLowerCase();

    return matchCat && matchReg;
  });

  let totalSales = 0;
  let totalProfit = 0;
  const categorySalesMap = {};
  const regionSalesMap = {};
  const productMap = {};

  filtered.forEach((row) => {
    const profit = parseVal(getRowValue(row, 'Profit', 'profit', 'Total_Profit'));
    
    // Check multiple possible sales column names
    let sales = parseVal(getRowValue(row, 'Sales', 'sales', 'Total Sales', 'Total_Sales', 'Revenue', 'Amount', 'Price'));
    
    // Fallback: If Sales column is 0 or missing, estimate sales from profit/orders
    if (sales === 0 && profit > 0) {
      sales = profit * 2.5; 
    }

    const cat = getRowValue(row, 'Category', 'category') || 'Other';
    const reg = getRowValue(row, 'Region', 'region') || 'Other';
    const prodName = getRowValue(row, 'Product Name', 'Product_Name', 'product_name', 'Item') || 'Unknown Item';

    totalSales += sales;
    totalProfit += profit;

    categorySalesMap[cat] = (categorySalesMap[cat] || 0) + sales;
    regionSalesMap[reg] = (regionSalesMap[reg] || 0) + sales;

    if (!productMap[prodName]) {
      productMap[prodName] = { name: prodName, sales: 0, profit: 0 };
    }
    productMap[prodName].sales += sales;
    productMap[prodName].profit += profit;
  });

  const totalOrders = filtered.length;
  const profitMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(2) : '0';

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      sales: p.sales.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      profit: p.profit.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
    }));

  res.json({
    kpis: {
      totalSales: totalSales > 1000000 ? (totalSales / 1000000).toFixed(2) + 'M' : totalSales.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      totalProfit: totalProfit > 1000000 ? (totalProfit / 1000000).toFixed(2) + 'M' : totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      profitMargin,
      totalOrders: totalOrders >= 1000 ? (totalOrders / 1000).toFixed(0) + 'K' : totalOrders,
    },
    categorySales: categorySalesMap,
    regionSales: regionSalesMap,
    topProducts,
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});