'use strict';
const bcrypt = require('bcryptjs')
const faker = require('faker')
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('Users', [{
      id: 1,
      name: 'John',
      email: 'example@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10)),
      address: 'taipei',
      telephone: '09342423',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    queryInterface.bulkInsert('Products', [{
      name: 'True麵',
      amount: 99,
      introduction: '巷口小吃裡，最令人懷念的熟悉滋味，甜辣口感老少咸宜，口口香甜最涮嘴，有台才敢大聲',
      image1: 'https://i.imgur.com/PJbCEj8.png',
      image2: 'https://i.imgur.com/qNlOYjl.png',
      price: 360,
      cost: 200,
      CatogoryId: 2,
      new: false,
      popular: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: '男士商務襯衫',
      amount: 99,
      introduction: '流線型剪裁，簡單俐落，採用富有彈性的科技纖維交織而成，兼具著靈活性、快乾且可抑制異味。設計上以亞洲人身型為出發點，搭載立體製版及全布剪裁科技，全程台灣研發製造，品質保證舒適且安心，創造全新穿著體驗。',
      image1: 'https://i.imgur.com/GXZW9Ly.png',
      image2: 'https://i.imgur.com/wPLxqM4.png',
      price: 880,
      cost: 600,
      CatogoryId: 1,
      new: true,
      popular: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: '涼感衣 (V領Skull)',
      amount: 99,
      introduction: '惡名昭彰的全新《IcedLite™ 冰涼紗》系列是在紡織過程中添加了礦玉粉末，藉由礦物質熱比小、熱平衡快的特性，達到快速降溫的目的。高表面面積具有類似活性碳的特質，因此也具有除臭功能。',
      image1: 'https://i.imgur.com/kTCoKDr.png',
      image2: 'https://i.imgur.com/5jeKS5i.png',
      price: 580,
      cost: 400,
      CatogoryId: 1,
      new: true,
      popular: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    queryInterface.bulkInsert('Catogories', [{
      id: 1,
      name: '衣服',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: '食品',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    queryInterface.bulkInsert('Transports', [{
      id: 1,
      name: '未出貨',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: '配送中',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      name: '已送達',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    return queryInterface.bulkInsert('Orders', [{
      id: 1,
      receiver: '大名',
      telephone: '0988765433',
      address: '台北市',
      UserId: 1,
      orderStatus: '未付款',
      TransportId: 1,
      totalPrice: 1223,
      sn: '',
      payment: '未付款',
      createdAt: new Date(),
      updatedAt: new Date()
    }])
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {});
    queryInterface.bulkDelete('Products', null, {});
    queryInterface.bulkDelete('Transports', null, {});
    queryInterface.bulkDelete('Catogories', null, {});
    return queryInterface.bulkDelete('Orders', null, {});
  }
};