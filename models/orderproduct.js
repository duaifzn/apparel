'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderProduct = sequelize.define('OrderProduct', {
    OrderID: DataTypes.INTEGER,
    ProductID: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {});
  OrderProduct.associate = function (models) {
    // associations can be defined here
  };
  return OrderProduct;
};