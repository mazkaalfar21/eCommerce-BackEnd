const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const { Produk, Order, OrderDetail, User, Brand, Kategori, Ukuran, ProdukUkuran } = require('../models');

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// ─── EXPORT PRODUK EXCEL ───────────────────────────────────────────────────
const exportProdukExcel = async (req, res, next) => {
  try {
    const produks = await Produk.findAll({
      include: [
        { model: Brand,        as: 'brand',      attributes: ['nama_brand'] },
        { model: Kategori,     as: 'kategori',   attributes: ['nama_kategori'] },
        { model: ProdukUkuran, as: 'stokUkuran',
          include: [{ model: Ukuran, as: 'ukuran', attributes: ['ukuran'] }] },
      ],
      order: [['id', 'ASC']],
    });

    const data = [];
    produks.forEach((p, i) => {
      const totalStok = p.stokUkuran?.reduce((s, u) => s + u.stok, 0) || 0;
      const ukuranList = p.stokUkuran?.map(u => `UK${u.ukuran?.ukuran}:${u.stok}`).join(', ') || '-';

      data.push({
        No:             i + 1,
        'Nama Produk':  p.nama_produk,
        Brand:          p.brand?.nama_brand || '-',
        Kategori:       p.kategori?.nama_kategori || '-',
        'Harga (Rp)':   parseFloat(p.harga),
        'Total Stok':   totalStok,
        'Stok per Ukuran': ukuranList,
        Featured:       p.is_featured ? 'Ya' : 'Tidak',
      });
    });

    const ws = XLSX.utils.json_to_sheet(data);

    // Atur lebar kolom
    ws['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 10 }, { wch: 40 }, { wch: 10 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produk');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-produk.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) { next(error); }
};

// ─── EXPORT PRODUK PDF ─────────────────────────────────────────────────────
const exportProdukPDF = async (req, res, next) => {
  try {
    const produks = await Produk.findAll({
      include: [
        { model: Brand,        as: 'brand',      attributes: ['nama_brand'] },
        { model: Kategori,     as: 'kategori',   attributes: ['nama_kategori'] },
        { model: ProdukUkuran, as: 'stokUkuran',
          include: [{ model: Ukuran, as: 'ukuran', attributes: ['ukuran'] }] },
      ],
      order: [['id', 'ASC']],
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-produk.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, 595, 80).fill('#1a1a2e');
    doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
      .text('ShoeStore', 40, 20);
    doc.fontSize(11).font('Helvetica')
      .text('Laporan Data Produk', 40, 46);
    doc.fillColor('#aaaaaa').fontSize(9)
      .text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, 62);

    doc.moveDown(2.5);

    // Kolom: No, Nama Produk, Brand, Kategori, Harga, Total Stok
    const cols  = [30, 160, 80, 80, 100, 60];
    const heads = ['No', 'Nama Produk', 'Brand', 'Kategori', 'Harga', 'Stok'];
    const rowH  = 22;
    let y = doc.y;
    let x = 40;

    // Header tabel
    doc.rect(x, y, cols.reduce((a, b) => a + b, 0), rowH).fill('#e11d48');
    heads.forEach((h, i) => {
      doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
        .text(h, x + 4, y + 7, { width: cols[i] - 8 });
      x += cols[i];
    });
    y += rowH;

    // Baris data
    produks.forEach((p, idx) => {
      if (y > 750) { doc.addPage(); y = 40; }

      x = 40;
      const totalStok = p.stokUkuran?.reduce((s, u) => s + u.stok, 0) || 0;
      const bg = idx % 2 === 0 ? '#f8f8f8' : '#ffffff';

      doc.rect(40, y, cols.reduce((a, b) => a + b, 0), rowH).fill(bg).stroke('#e5e5e5');

      const row = [
        idx + 1,
        p.nama_produk,
        p.brand?.nama_brand || '-',
        p.kategori?.nama_kategori || '-',
        formatRupiah(p.harga),
        totalStok,
      ];

      row.forEach((val, i) => {
        doc.fillColor('#333333').fontSize(8).font('Helvetica')
          .text(String(val), x + 4, y + 7, { width: cols[i] - 8, ellipsis: true });
        x += cols[i];
      });
      y += rowH;
    });

    // Footer
    doc.moveDown(1);
    doc.fillColor('#999999').fontSize(8)
      .text(`Total: ${produks.length} produk`, 40, y + 10);

    doc.end();
  } catch (error) { next(error); }
};

// ─── EXPORT ORDER EXCEL ────────────────────────────────────────────────────
const exportOrderExcel = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['nama', 'email', 'telepon'] }],
      order: [['createdAt', 'DESC']],
    });

    const data = orders.map((o, i) => ({
      No:           i + 1,
      'ID Order':   o.id,
      Pelanggan:    o.user?.nama || '-',
      Email:        o.user?.email || '-',
      Telepon:      o.user?.telepon || '-',
      'Tanggal':    new Date(o.tanggal_order).toLocaleDateString('id-ID'),
      'Total (Rp)': parseFloat(o.total_harga),
      Status:       o.status,
      'Alamat':     o.alamat_pengiriman || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 5 }, { wch: 10 }, { wch: 25 }, { wch: 25 },
      { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 35 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="laporan-order.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) { next(error); }
};

// ─── EXPORT ORDER PDF ──────────────────────────────────────────────────────
const exportOrderPDF = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['nama', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-order.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, 595, 80).fill('#1a1a2e');
    doc.fillColor('white').fontSize(20).font('Helvetica-Bold').text('ShoeStore', 40, 20);
    doc.fontSize(11).font('Helvetica').text('Laporan Data Order', 40, 46);
    doc.fillColor('#aaaaaa').fontSize(9)
      .text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, 62);

    doc.moveDown(2.5);

    const cols  = [30, 120, 80, 100, 80, 100];
    const heads = ['No', 'Pelanggan', 'Tanggal', 'Total', 'Status', 'Alamat'];
    const rowH  = 22;
    let y = doc.y;
    let x = 40;

    doc.rect(x, y, cols.reduce((a, b) => a + b, 0), rowH).fill('#e11d48');
    heads.forEach((h, i) => {
      doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
        .text(h, x + 4, y + 7, { width: cols[i] - 8 });
      x += cols[i];
    });
    y += rowH;

    orders.forEach((o, idx) => {
      if (y > 750) { doc.addPage(); y = 40; }

      x = 40;
      const bg = idx % 2 === 0 ? '#f8f8f8' : '#ffffff';
      doc.rect(40, y, cols.reduce((a, b) => a + b, 0), rowH).fill(bg).stroke('#e5e5e5');

      const row = [
        idx + 1,
        o.user?.nama || '-',
        new Date(o.tanggal_order).toLocaleDateString('id-ID'),
        formatRupiah(o.total_harga),
        o.status,
        o.alamat_pengiriman || '-',
      ];

      row.forEach((val, i) => {
        doc.fillColor('#333333').fontSize(8).font('Helvetica')
          .text(String(val), x + 4, y + 7, { width: cols[i] - 8, ellipsis: true });
        x += cols[i];
      });
      y += rowH;
    });

    doc.moveDown(1);
    doc.fillColor('#999999').fontSize(8)
      .text(`Total: ${orders.length} order`, 40, y + 10);

    doc.end();
  } catch (error) { next(error); }
};

module.exports = { exportProdukExcel, exportProdukPDF, exportOrderExcel, exportOrderPDF };
