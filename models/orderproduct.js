'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderProduct = sequelize.define('OrderProduct', {
    OrderId: DataTypes.INTEGER,
    ProductId: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {});
  OrderProduct.associate = function (models) {
    OrderProduct.belongsTo(models.Order)
    OrderProduct.belongsTo(models.Product)
  };
  return OrderProduct;
};