var moment = require('./moment.min');

// 格式化订单
var formatNews = function (news) {
	return news.map(item => {
		var time = moment(item.postTime);
		var zero = moment().format('YYYY-MM-DD');
		var after = moment(time).isAfter(zero);
		if (after) {
			item.time = moment(item.postTime).format('HH:mm');
		} else {
			item.time = moment(item.postTime).format('YYYY-MM-DD HH:mm');
		}
		return item;
	});
}

module.exports = {
	formatNews
}