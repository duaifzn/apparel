'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    receiver: DataTypes.STRING,
    telephone: DataTypes.STRING,
    address: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    orderStatusId: DataTypes.INTEGER,
    transportId: DataTypes.INTEGER
  }, {});
  Order.associate = function (models) {
    Order.belongsTo(models.User)
    Order.belongsTo(models.Transport)
    Order.belongsTo(models.OrderStatus)
    Order.belongsToMany(models.Product, {
      through: models.OrderProduct,
      foreignKey: 'orderId',
      as: 'getProduct'
    })
  };
  return Order;
};