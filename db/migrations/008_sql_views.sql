-- View sales_with_lookup: JOIN sales+customer+employee+salesDetail+priceHist for enriched list. View salesdetail_with_product: JOIN salesDetail+product+current priceHist
-- ============================================================
-- Migration 008: SQL Views
-- All 5 views needed for Sprint 2 (CRUD UI) and Sprint 3 (Reports)
-- Must run AFTER 001_hopedb_base_tables.sql.
-- ============================================================

-- --------------------------------------------------------
-- VIEW 1: sales_with_lookup
-- Sales list enriched with customer name, employee name,
-- line item count, and total amount (quantity × current unit price).
-- Used by: SalesListPage
-- --------------------------------------------------------
CREATE OR REPLACE VIEW public.sales_with_lookup AS
SELECT
  s.transNo,
  s.salesDate,
  s.record_status,
  s.stamp,
  s.custNo,
  c.custname,
  c.payterm,
  s.empNo,
  e.lastname || ', ' || e.firstname AS empName,
  COUNT(sd.prodCode)                AS lineItemCount,
  COALESCE(SUM(sd.quantity * ph.unitPrice), 0) AS totalAmount
FROM public.sales s
JOIN public.customer    c  ON c.custno  = s.custNo
JOIN public.employee    e  ON e.empno   = s.empNo
LEFT JOIN public.salesDetail sd
       ON sd.transNo = s.transNo AND sd.record_status = 'ACTIVE'
LEFT JOIN (
  SELECT prodCode, unitPrice
  FROM public.priceHist ph1
  WHERE effDate = (
    SELECT MAX(effDate) FROM public.priceHist WHERE prodCode = ph1.prodCode
  )
) ph ON ph.prodCode = sd.prodCode
GROUP BY
  s.transNo, s.salesDate, s.record_status, s.stamp,
  s.custNo, c.custname, c.payterm,
  s.empNo, e.lastname, e.firstname
ORDER BY s.salesDate DESC;

-- --------------------------------------------------------
-- VIEW 2: salesdetail_with_product
-- SalesDetail lines enriched with product description, unit,
-- current unit price, and computed line total.
-- Used by: SalesDetailPage
-- --------------------------------------------------------
CREATE OR REPLACE VIEW public.salesdetail_with_product AS
SELECT
  sd.transNo,
  sd.prodCode,
  sd.quantity,
  sd.record_status,
  sd.stamp,
  p.description,
  p.unit,
  ph.unitPrice,
  sd.quantity * ph.unitPrice AS lineTotal
FROM public.salesDetail sd
JOIN public.product p ON p.prodCode = sd.prodCode
LEFT JOIN (
  SELECT prodCode, unitPrice
  FROM public.priceHist ph1
  WHERE effDate = (
    SELECT MAX(effDate) FROM public.priceHist WHERE prodCode = ph1.prodCode
  )
) ph ON ph.prodCode = sd.prodCode;

-- --------------------------------------------------------
-- VIEW 3: sales_by_employee
-- Total transactions and total revenue grouped by sales agent.
-- Used by: ReportsPage
-- --------------------------------------------------------
CREATE OR REPLACE VIEW public.sales_by_employee AS
SELECT
  e.empno,
  e.lastname || ', ' || e.firstname AS empName,
  COUNT(DISTINCT s.transNo)         AS totalTransactions,
  COALESCE(SUM(sd.quantity * ph.unitPrice), 0) AS totalRevenue
FROM public.employee e
JOIN public.sales s
     ON s.empNo = e.empno AND s.record_status = 'ACTIVE'
JOIN public.salesDetail sd
     ON sd.transNo = s.transNo AND sd.record_status = 'ACTIVE'
JOIN (
  SELECT prodCode, unitPrice
  FROM public.priceHist ph1
  WHERE effDate = (
    SELECT MAX(effDate) FROM public.priceHist WHERE prodCode = ph1.prodCode
  )
) ph ON ph.prodCode = sd.prodCode
GROUP BY e.empno, e.lastname, e.firstname
ORDER BY totalRevenue DESC;

-- --------------------------------------------------------
-- VIEW 4: sales_by_customer
-- Total transactions and total revenue grouped by customer.
-- Used by: ReportsPage
-- --------------------------------------------------------
CREATE OR REPLACE VIEW public.sales_by_customer AS
SELECT
  c.custno,
  c.custname,
  COUNT(DISTINCT s.transNo)         AS totalTransactions,
  COALESCE(SUM(sd.quantity * ph.unitPrice), 0) AS totalRevenue
FROM public.customer c
JOIN public.sales s
     ON s.custNo = c.custno AND s.record_status = 'ACTIVE'
JOIN public.salesDetail sd
     ON sd.transNo = s.transNo AND sd.record_status = 'ACTIVE'
JOIN (
  SELECT prodCode, unitPrice
  FROM public.priceHist ph1
  WHERE effDate = (
    SELECT MAX(effDate) FROM public.priceHist WHERE prodCode = ph1.prodCode
  )
) ph ON ph.prodCode = sd.prodCode
GROUP BY c.custno, c.custname
ORDER BY totalRevenue DESC;

-- --------------------------------------------------------
-- VIEW 5: top_products_sold
-- Products ranked by total quantity sold and total revenue.
-- Used by: ReportsPage
-- --------------------------------------------------------
CREATE OR REPLACE VIEW public.top_products_sold AS
SELECT
  p.prodCode,
  p.description,
  p.unit,
  SUM(sd.quantity)                  AS totalQtySold,
  COALESCE(SUM(sd.quantity * ph.unitPrice), 0) AS totalRevenue
FROM public.product p
JOIN public.salesDetail sd
     ON sd.prodCode = p.prodCode AND sd.record_status = 'ACTIVE'
JOIN (
  SELECT prodCode, unitPrice
  FROM public.priceHist ph1
  WHERE effDate = (
    SELECT MAX(effDate) FROM public.priceHist WHERE prodCode = ph1.prodCode
  )
) ph ON ph.prodCode = sd.prodCode
GROUP BY p.prodCode, p.description, p.unit
ORDER BY totalRevenue DESC;

-- --------------------------------------------------------
-- VIEW 6: monthly_sales_trend
-- Revenue and transaction count grouped by calendar month.
-- Used by: ReportsPage
-- --------------------------------------------------------
CREATE OR REPLACE VIEW public.monthly_sales_trend AS
SELECT
  TO_CHAR(s.salesDate, 'YYYY-MM') AS saleMonth,
  COUNT(DISTINCT s.transNo)        AS totalTransactions,
  COALESCE(SUM(sd.quantity * ph.unitPrice), 0) AS totalRevenue
FROM public.sales s
JOIN public.salesDetail sd
     ON sd.transNo = s.transNo AND sd.record_status = 'ACTIVE'
JOIN (
  SELECT prodCode, unitPrice
  FROM public.priceHist ph1
  WHERE effDate = (
    SELECT MAX(effDate) FROM public.priceHist WHERE prodCode = ph1.prodCode
  )
) ph ON ph.prodCode = sd.prodCode
WHERE s.record_status = 'ACTIVE'
GROUP BY TO_CHAR(s.salesDate, 'YYYY-MM')
ORDER BY saleMonth ASC;
