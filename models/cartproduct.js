'use strict';
module.exports = (sequelize, DataTypes) => {
  const CartProduct = sequelize.define('CartProduct', {
    UserId: DataTypes.INTEGER,
    ProductId: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
  }, {});
  CartProduct.associate = function (models) {
    CartProduct.belongsTo(models.Product)
    CartProduct.belongsTo(models.User)
  };
  return CartProduct;
};