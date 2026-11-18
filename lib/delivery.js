function scheduleDelivery(order) {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 1);
  const iso = deliveryDate.toISOString().slice(0, 10);

  return {
    orderId: order.orderId,
    status: 'scheduled',
    deliveryDate: iso,
    deliveryWindow: '09:00-17:00',
    partner: 'SeniorSpeak Mock Delivery',
  };
}

module.exports = { scheduleDelivery };
