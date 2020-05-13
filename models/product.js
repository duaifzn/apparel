'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    introduction: DataTypes.TEXT,
    image1: DataTypes.STRING,
    image2: DataTypes.STRING,
    price: DataTypes.INTEGER,
    cost: DataTypes.INTEGER,
    CatogoryId: DataTypes.INTEGER,
    new: DataTypes.BOOLEAN,
    popular: DataTypes.BOOLEAN
  }, {});
  Product.associate = function (models) {
    Product.belongsTo(models.Catogory)
    Product.hasMany(models.CartProduct)
    Product.belongsToMany(models.Order, {
      through: models.OrderProduct,
      foreignKey: 'ProductId',
      as: 'getOrder'
    })

  };
  return Product;
};