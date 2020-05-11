module.exports = {
    codeToSMS: function(count: any) {
        var chars = '0123456789'.split('');
        var result = '';
        for (var i = 0; i < count; i++) {
            var x = Math.floor(Math.random() * chars.length);
            result += chars[x];
        }
        return result;
    }
}