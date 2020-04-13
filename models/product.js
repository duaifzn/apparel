'use strict';
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define('Product', {
    name: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    introduction: DataTypes.TEXT,
    image1: DataTypes.STRING,
    image2: DataTypes.STRING,
    price: DataTypes.INTEGER,
    cost: DataTypes.INTEGER,
    catogoryId: DataTypes.INTEGER
  }, {});
  Product.associate = function (models) {
    Product.belongsTo(models.Catogory)
    Product.belongsToMany(models.Order, {
      through: models.OrderProduct,
      foreignKey: 'productId',
      as: 'getOrder'
    })
  };
  return Product;
};