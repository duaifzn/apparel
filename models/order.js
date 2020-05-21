'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    receiver: DataTypes.STRING,
    telephone: DataTypes.STRING,
    address: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    orderStatus: DataTypes.STRING,
    TransportId: DataTypes.INTEGER,
    totalPrice: DataTypes.INTEGER,
    sn: DataTypes.STRING,
    payment: DataTypes.STRING,
    reason: DataTypes.STRING,
  }, {});
  Order.associate = function (models) {
    Order.belongsTo(models.User)
    Order.belongsTo(models.Transport)
    Order.belongsToMany(models.Product, {
      through: models.OrderProduct,
      foreignKey: 'OrderId',
      as: 'getProduct'
    })
  };
  return Order;
};