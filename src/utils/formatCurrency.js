module.exports = function formatCurrency(amount) {
  return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};
