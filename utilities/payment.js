const sumPayment = (sqlResult) => {
  const paymentSum = new Map();
  for (const order of sqlResult) {
    const userId = parseInt(order.user_id),
      total = parseInt(order.total);
    if (userId in paymentSum) {
      paymentSum[userId] += total;
    } else {
      paymentSum[userId] = total;
    }
  }
  return paymentSum;
};

const generateResponseFromPaymentSum = (userPayment) => {
  const response = [];
  for (const [userId, total] of Object.entries(userPayment)) {
    response.push({ user_id: userId, total_payment: total });
  }
  return response;
};

module.exports = { sumPayment, generateResponseFromPaymentSum };
