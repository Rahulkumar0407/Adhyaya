
const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = 'd:\\Adhyaya\\Adhyaya\\client\\public\\assets';
const file = path.join(dir, 'payment-qr.png');
const url = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=paytmqr281005050101150325@paytm&pn=Adhyaya&mc=5732&tid=cxnkj89&tr=1234&tn=Adhyaya%20Wallet%20Topup&am=0&cu=INR';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

if (fs.existsSync(file)) {
    console.log('File exists:', file);
    const stats = fs.statSync(file);
    console.log('Size:', stats.size);
} else {
    console.log('File does not exist. Downloading...');
    const fileStream = fs.createWriteStream(file);
    https.get(url, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log('Download finished');
        });
    }).on('error', (err) => {
        fs.unlink(file);
        console.error('Error downloading:', err.message);
    });
}
