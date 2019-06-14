const paypal = require("paypal-rest-sdk");
const env = require("../env/environment");

paypal.configure({
	mode: "sandbox",
	client_id: env.clientId,
	client_secret: env.secretKey,
});

function pay(req, res) {
	const payItems = req.body;
	const { currency, description } = payItems;

	const totalValue = payItems.items.reduce((total, item) => {
		return total + item.price * item.quantity;
	}, 0);

	const createPaymentJson = {
		intent: "sale",
		payer: {
			payment_method: "paypal",
		},
		redirect_urls: {
			return_url: `http://localhost:3000/success?total=${totalValue}&currency=${currency}`,
			cancel_url: "http://localhost:3000/cancel",
		},
		transactions: [
			{
				item_list: {
					items: payItems.items,
				},
				amount: {
					currency: currency,
					total: totalValue,
				},
				description: description,
			},
		],
	};

	paypal.payment.create(createPaymentJson, (err, payment) => {
		if (err) {
			console.log(err);
			throw err;
		} else {
			console.log(payment);
			payment.links.forEach((link) => {
				if (link.rel === "approval_url") {
					res.send(link.href);
				}
			});
		}
	});
}

function success(req, res) {
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;
	const total = req.query.total;
	const currency = req.query.currency;

	const executePaymentJson = {
		payer_id: payerId,
		transactions: [
			{
				amount: {
					currency: currency,
					total: total,
				},
			},
		],
	};

	paypal.payment.execute(paymentId, executePaymentJson, (err, payment) => {
		if (err) {
			console.log(err);
			throw err;
		} else {
			console.log(payment);
			res.send(payment);
		}
	});
}

module.exports = {
	pay,
	success,
};
