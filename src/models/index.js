const { sequelize } = require('../config/database');
const User         = require('./User');
const Brand        = require('./Brand');
const Kategori     = require('./Kategori');
const Ukuran       = require('./Ukuran');
const Produk       = require('./Produk');
const ProdukUkuran = require('./ProdukUkuran');
const Order        = require('./Order');
const OrderDetail  = require('./OrderDetail');

// Produk -> Brand (N:1)
Produk.belongsTo(Brand,    { foreignKey: 'brand_id',    as: 'brand' });
Brand.hasMany(Produk,      { foreignKey: 'brand_id',    as: 'produk' });

// Produk -> Kategori (N:1)
Produk.belongsTo(Kategori, { foreignKey: 'kategori_id', as: 'kategori' });
Kategori.hasMany(Produk,   { foreignKey: 'kategori_id', as: 'produk' });

// Produk -> ProdukUkuran (1:N) - stok per ukuran
Produk.hasMany(ProdukUkuran,    { foreignKey: 'produk_id', as: 'stokUkuran' });
ProdukUkuran.belongsTo(Produk,  { foreignKey: 'produk_id', as: 'produk' });

// Ukuran -> ProdukUkuran (1:N)
Ukuran.hasMany(ProdukUkuran,    { foreignKey: 'ukuran_id', as: 'stokProduk' });
ProdukUkuran.belongsTo(Ukuran,  { foreignKey: 'ukuran_id', as: 'ukuran' });

// User -> Order (1:N)
User.hasMany(Order,   { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order -> OrderDetail (1:N)
Order.hasMany(OrderDetail,    { foreignKey: 'order_id', as: 'details' });
OrderDetail.belongsTo(Order,  { foreignKey: 'order_id', as: 'order' });

// Produk -> OrderDetail (1:N)
Produk.hasMany(OrderDetail,    { foreignKey: 'produk_id', as: 'orderDetails' });
OrderDetail.belongsTo(Produk,  { foreignKey: 'produk_id', as: 'produk' });

// Ukuran -> OrderDetail (1:N)
Ukuran.hasMany(OrderDetail,    { foreignKey: 'ukuran_id', as: 'orderDetails' });
OrderDetail.belongsTo(Ukuran,  { foreignKey: 'ukuran_id', as: 'ukuran' });

module.exports = {
  sequelize,
  User, Brand, Kategori, Ukuran,
  Produk, ProdukUkuran,
  Order, OrderDetail,
};
