const fs = require('fs');
const path = require('path');

const basePath = process.argv[2];
const files = [
  'Backend/utils/sendEmail.js',
  'Backend/services/emailService.js',
  'Backend/server.js',
  'Backend/controllers/rewardController.js',
  'Backend/controllers/authController.js',
  'Frontend/index.html',
  'Frontend/src/components/ChatInterface.jsx',
  'Frontend/src/components/common/Footer.jsx',
  'Frontend/src/components/common/Navbar.jsx',
  'Frontend/src/components/auth/AuthBanner.jsx',
  'Frontend/src/components/auth/RegisterForm.jsx',
  'Frontend/src/pages/AuthPage.jsx',
  'Frontend/src/pages/AdminLogin.jsx',
  'Frontend/src/pages/LoginRegister.jsx'
];

files.forEach(f => {
  const p = path.join(basePath, f);
  if(fs.existsSync(p)) {
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/DriveSutra/g, 'driveSutraGo');
    text = text.replace(/driveSutra(?!\.com)(?!Go)/g, 'driveSutraGo'); 
    text = text.replace(/driveSutraGoGo/gi, 'driveSutraGo'); // catch any double
    fs.writeFileSync(p, text);
    console.log('Updated ' + f);
  }
});
